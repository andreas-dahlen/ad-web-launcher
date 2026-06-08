# Kotlin Audit Report

## Project Summary

### What the Kotlin layer currently does
- Hosts a full-screen WebView loading a Vue web app from `android_asset/`
- Intercepts all touch events at the native layer, converts to CSS-px coordinates, and forwards to JS via `evaluateJavascript`
- Runs a Choreographer-based frame loop that manually invalidates the WebView at ~30fps
- Contains a full momentum/inertia physics engine (`MomentumRunner.kt`) that is **never called**
- Provides a JS→Kotlin bridge for launching apps and placeholder actions
- Duplicates the web layer's debug/logging infrastructure in Kotlin

### What it *should* do
- Host a full-screen hardware-accelerated WebView
- Forward raw touch events to JS with minimal transformation
- Inject device metrics (screen size, density, platform flag)
- Expose a JS bridge for Android-only capabilities (launch app, system settings, etc.)
- Manage lifecycle (pause/resume WebView, immersive mode)
- Nothing else

---

## File-by-File Audit

---

### GestureDebug.kt

**Current Responsibility**
- Mirrors the JS `DEBUG` flag object (`lagTime`, `swipeEngine`, `kotlinBridge`)
- Implements `track()` / `logLag()` — a Kotlin-side lag timer identical to JS `debugLagTime()`
- Provides a gated `log(key, vararg args)` that mirrors JS `log(key, ...args)`

**Assessment**
- **DELETE** (or reduce to a single `Log.d` wrapper with a global on/off flag)
- The JS debug system is the authoritative one. The web layer already has `debugLagTime()`, `log()`, and `drawDots()` with per-channel gating via `debugFlags.js`.
- Kotlin-side lag tracking is useful only if you suspect the Kotlin→JS bridge itself is slow. That's a one-off profiling need, not a permanent runtime system.
- The `DEBUG` object duplicates `appSettings.DEBUG` and will inevitably drift out of sync.
- `swipeEngine` flag gates logs for `MomentumRunner` which should be deleted (see below).

**Notes**
- Not a wallpaper artifact per se, but overengineered for a thin container layer.
- Architectural violation: Kotlin should not maintain its own debug flag registry. If Kotlin needs debug output, a single `const val DEBUG = BuildConfig.DEBUG` and raw `Log.d()` calls are sufficient.

**Recommended Action**
- Delete the file. If you want a kill-switch for Kotlin logs, use a single `const val VERBOSE = false` in `LauncherActivity` or `BuildConfig.DEBUG`. No object hierarchy needed.

---

### JSBridge.kt

**Current Responsibility**
- `@JavascriptInterface openApp(packageName)` — launches an app by package name
- `@JavascriptInterface launchPlaceholder(action)` — empty stub
- `performAction(action, payload)` — internal dispatcher (not annotated as `@JavascriptInterface`, so JS can't call it)

**Assessment**
- **KEEP — minor cleanup needed**
- This is a legitimate Kotlin responsibility. Launching apps requires Android APIs that JS cannot access.
- The file is small and correctly scoped.

**Notes**
- `launchPlaceholder` is dead code. Delete it or replace it with a real contract when needed.
- `performAction()` is unreachable from JS (no `@JavascriptInterface` annotation) and unused from Kotlin. It's speculative architecture — delete it.
- No wallpaper artifacts.

**Recommended Action**
- Remove `launchPlaceholder()` and `performAction()`.
- Result: a single-method bridge class. That's correct for this stage.

---

### LauncherActivity.kt

**Current Responsibility**
- Creates a full-screen immersive WebView
- Intercepts all `MotionEvent`s, converts pixel coords → CSS-px coords, and calls `handleTouch(type, x, y, seqId)` in JS
- Throttles move events to ~60fps via `SystemClock.uptimeMillis()` check
- Runs a `Choreographer` frame loop at ~30fps that calls `webView.invalidate()`
- Injects `window.__DEVICE` with screen dimensions and density
- Calls `window.initAndroidEngine()` with retry logic on page load
- Manages gesture sequence IDs to ignore stale events

**Assessment**
- **REFACTOR — significant simplification possible**

**Problem 1: The frame loop is unnecessary**
WebView has its own compositor and schedules repaints internally when DOM/CSS changes. The `startFrameLoop()` / `stopFrameLoop()` / `needsRedraw` / `webView.invalidate()` machinery is a wallpaper-era artifact. In a wallpaper (WallpaperService.Engine), you *must* manually drive rendering because there's no built-in display list. In an Activity-hosted WebView, you don't.

The inline comment even acknowledges this:
> "WebView already schedules its own draws. Invalidating manually is fine only because you throttle it."

It's not "fine" — it's pointless overhead. CSS transitions and JS-driven style changes already trigger WebView repaints. Removing this will simplify the class and eliminate a source of unnecessary battery drain.

**Problem 2: Touch coordinate math is more complex than needed**
The `handleTouch` method has multiple fallback chains (`webView.width` → `measuredWidth` → `displayMetrics`), safe-division guards, and a two-step normalization (normalize to 0–1 via view dimensions, then scale to CSS-px via device dimensions). This can be simplified:
- After `onResume`, `deviceDensity` is always set.
- `event.x / deviceDensity` and `event.y / deviceDensity` gives CSS-px directly, because `event.x` is already in the WebView's coordinate space and device-px ÷ density = CSS-px.
- The current code re-derives this through ratios and fallbacks, which is harder to reason about and introduces subtle edge cases when `webView.width ≠ deviceWidthPx` (e.g., during layout transitions).

**Problem 3: `gestureSeqId` is duplicated between Kotlin and JS**
Kotlin increments and sends `gestureSeqId`. JS (`inputSource.js`) stores `currentSeqId` and filters stale events. This is correct and lightweight — keep it.

**Notes**
- Frame loop = wallpaper artifact. Direct delete.
- Move throttle at 16ms (~60fps) is reasonable. Keep it.
- `initializeGestureEngine` with retry is fine — page load timing is unpredictable. Keep it.
- `injectDeviceMetrics` is correct and needed. Keep it.
- `captureDeviceMetrics` correctly handles API 30+ vs legacy. Keep it.

**Recommended Action**
1. Delete `startFrameLoop()`, `stopFrameLoop()`, `frameCallback`, `frameThrottleMs`, `lastFrameTimeMs`, `needsRedraw`, and all references to them.
2. Delete the `choreographer` field entirely.
3. Simplify `handleTouch` coordinate math to `event.x / deviceDensity`, `event.y / deviceDensity`.
4. Remove `handler.postDelayed` in `ACTION_UP` (was there to trigger `needsRedraw`).
5. `sendToJS` becomes a pure two-liner: `evaluateJavascript(...)` + optionally log.

---

### MomentumRunner.kt

**Current Responsibility**
- Full inertia/momentum physics engine running on `Choreographer`
- Tracks velocity via exponential smoothing on move events
- On finger-up, runs a decay animation loop posting synthetic positions
- Uses configurable decay, min-velocity, velocity blending constants

**Assessment**
- **DELETE**
- This file is **completely unused**. Nothing in `LauncherActivity`, `JSBridge`, or anywhere else calls `MomentumRunner.onDown/onMove/onUp`.
- The web layer owns all gesture physics. The `intentDeriver` → `solver` → `dispatcher` pipeline handles swipe commit/revert decisions, and CSS transitions handle animation.
- Even if Kotlin-side momentum were desirable (it isn't — it would bypass the web's gesture contract), this would send synthetic move events through `sendToJS` which would confuse the `intentDeriver` state machine.
- This is a **wallpaper-era artifact**. In a wallpaper, Kotlin had to run its own physics because there was no WebView gesture pipeline.

**Notes**
- Classic dead code. No callers. No integration path.
- The `DECAY`, `MIN_VELOCITY`, `VELOCITY_BLEND` constants are tuning values for a system that doesn't exist.
- Keeping it "for later" is harmful — it suggests Kotlin should own physics, which violates the architecture.

**Recommended Action**
- Delete the file entirely. If momentum tuning is ever needed, it belongs in the web layer's solvers.

---

## Cross-Cutting Observations

### Patterns that don't belong in app-world Kotlin

| Pattern | Where | Why it's wrong |
|---------|-------|----------------|
| Manual `Choreographer` frame loop | `LauncherActivity` | WebView manages its own rendering. This is a `WallpaperService.Engine` pattern. |
| `webView.invalidate()` on a timer | `LauncherActivity` | Unnecessary; DOM changes trigger repaints automatically. |
| Momentum physics engine | `MomentumRunner` | Web layer owns gesture resolution and animation. |
| Parallel debug flag system | `GestureDebug` | Duplicates JS `debugFlags.js` / `appSettings.DEBUG`. Will drift. |
| `needsRedraw` dirty flag | `LauncherActivity` | Irrelevant when WebView owns its display list. |

### Things that should be removed

- **`MomentumRunner.kt`** — dead code, zero callers, architectural violation.
- **`GestureDebug.kt`** — unnecessary duplication of JS debug infra.
- **Frame loop in `LauncherActivity`** — wallpaper artifact, battery cost for no benefit.
- **`launchPlaceholder` and `performAction` in `JSBridge`** — dead code / speculative.

### Missing but expected Kotlin responsibilities

| Responsibility | Status | Notes |
|----------------|--------|-------|
| Forward `onResume`/`onPause` to JS | **Missing** | JS may need to pause timers, refresh state. A simple `evaluateJavascript("window.__onLifecycle?.('resume')")` in `onResume`/`onPause` would suffice. |
| Back button handling | **Missing** | Default behavior closes the activity. A launcher should intercept back and potentially forward to JS. |
| Permission requests | **Missing** | Will be needed for launcher features (e.g., wallpaper setting, notification access). Not urgent but expected. |
| Deep link / intent handling | **Missing** | A launcher receives intents. Will need `onNewIntent` forwarding eventually. |

---

## Minimal Kotlin Target State

After cleanup, the Kotlin layer should contain **two files**:

### `LauncherActivity.kt` (~120 lines)
- `onCreate`: immersive mode, create WebView, load `index.html`
- `onResume` / `onPause`: WebView lifecycle, inject device metrics, notify JS
- `onDestroy`: cleanup
- `handleTouch`: convert `MotionEvent` → CSS-px, throttle moves, call `handleTouch()` in JS
- `sendToJS`: one-line `evaluateJavascript` wrapper
- `injectDeviceMetrics` / `captureDeviceMetrics`: as-is
- `initializeGestureEngine`: as-is (with retry)

### `JSBridge.kt` (~20 lines)
- `openApp(packageName)`: launch external app
- Future methods as needed (settings, permissions, etc.)

### Deleted
- `MomentumRunner.kt` — dead code
- `GestureDebug.kt` — unnecessary duplication

### Net result
- ~140 lines of Kotlin total
- Zero physics, zero rendering loops, zero debug flag registries
- Kotlin is a dumb pipe: touch events in, JS bridge calls out, lifecycle signals forwarded
