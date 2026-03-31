# Interaction System Fix Plan

> Merged from `carousel_migration_audit.md` and `interaction_audit.md`  
> **Generated:** 2026-03-30

---

## 🔴 Critical Issues (Fix First)

### 1. Pipeline event routing is broken — `swipeRevert` is dead code
**Severity:** Critical  
**Fix Difficulty:** Medium  

**Problem:**  
The old pipeline merged solver results into `runtime`, so `runtime.event = 'swipeRevert'` was respected downstream. The new pipeline merges solver results into `solutions`, but dispatches based on `base.event` — which the solver never overwrites. Additionally, the carousel solver writes `event: 'swipeRevert'` but the `CarouselSolutions` type defines the field as `eventChange`, not `event`. Nobody reads either.

**Why it matters:**  
Any carousel swipe that doesn't meet the commit threshold calls `swipeCommit` instead of `swipeRevert`. Since `swipeCommit` sets `pendingDir = null` (no direction from solver) and `offset = s.offset` (unchanged), the CSS transition enables but nothing moves. Panels stay stuck at the partial drag position. The carousel is visually broken after every rejected swipe.

**Recommended Fix:**  
```ts
// 1. carouselSolver.ts — use eventChange (not event) for revert returns:
return { eventChange: 'swipeRevert', stateAccepted: true }

// 2. pipeline.ts — resolve event from solutions before dispatch:
const resolvedEvent = (modDesc.type !== 'button' && modDesc.solutions?.eventChange)
  ? modDesc.solutions.eventChange
  : modDesc.base.event

// Use resolvedEvent in the switch cases:
const fn = state[resolvedEvent as keyof CarouselFunctions]

// Also update the base.event for the renderer:
if (modDesc.type !== 'button' && modDesc.solutions?.eventChange) {
  modDesc.base.event = modDesc.solutions.eventChange as EventType
}

// 3. renderer.ts — no change needed if base.event is patched above.
//    Otherwise, read from same resolved source.

// 4. solutions.ts — rename eventChange to something clearer, or keep it.
//    Just make sure it's consistent across solver + pipeline.
```

**Notes:**  
Also re-add the `stateAccepted` guard in the pipeline (see issue #7) to prevent dispatch when solvers reject.

---

### 2. Fallback `size: 0` in `useCarouselZustand` produces NaN transforms
**Severity:** Critical  
**Fix Difficulty:** Easy  

**Problem:**  
The fallback object in `useCarouselZustand` has `size: 0` (a number) instead of `{ x: 0, y: 0 }` (a `Vec2`). Before the `useEffect` calling `init` fires, the component renders with this fallback. `Carousel.tsx` reads `size.x` / `size.y` → `(0).x` is `undefined` → `laneSize` is `undefined` → `translate3d(NaNpx, 0, 0)` → browser ignores the transform entirely.

**Why it matters:**  
All three scene panels stack at position 0,0 on first render. This produces a visible flash/flicker on every carousel mount before the real layout kicks in.

**Recommended Fix:**  
```ts
// useCarouselZustand.ts
export const useCarouselZustand = (id: string) => {
  // Synchronous init — state exists before first selector run
  carouselStore.getState().init(id)

  return carouselStore(
    useShallow(s => s.carouselStore[id] ?? {
      index: 0,
      count: 0,
      offset: 0,
      dragging: false,
      size: { x: 0, y: 0 },   // ← was: 0
      settling: false,
      pendingDir: null          // ← was: missing
    })
  )
}
```

**Notes:**  
Moving `init` out of `useEffect` and into the hook body (synchronous) eliminates the timing race entirely. `init` is already idempotent (`if (get().carouselStore[id]) return`), so calling it on every render is safe and cheap. This also fixes issue #4 below.

---

### 3. `dragState.setConstraints` copy-paste bug — Y-axis constraints never set
**Severity:** Critical  
**Fix Difficulty:** Easy  

**Problem:**  
```ts
setConstraints: (id, packet) => {
  set(state => {
    const s = state.dragStore[id]
    if (packet.minX !== undefined) s.minX = packet.minX;
    if (packet.maxX !== undefined) s.maxX = packet.maxX;
    if (packet.minX !== undefined) s.minX = packet.minX;  // ← duplicate
    if (packet.maxX !== undefined) s.maxX = packet.maxX;  // ← duplicate
  })
},
```
Lines 3–4 are copy-pasted from lines 1–2. `minY` and `maxY` are never written.

**Why it matters:**  
Any drag element with vertical boundaries (`minY`, `maxY`) behaves as if those constraints are `±Infinity`. Elements can be dragged off-screen vertically with no clamping.

**Recommended Fix:**  
```ts
setConstraints: (id, packet) => {
  set(state => {
    const s = state.dragStore[id]
    if (packet.minX !== undefined) s.minX = packet.minX;
    if (packet.maxX !== undefined) s.maxX = packet.maxX;
    if (packet.minY !== undefined) s.minY = packet.minY;
    if (packet.maxY !== undefined) s.maxY = packet.maxY;
  })
},
```

---

## 🟠 High Priority Issues

### 4. Async `init` pattern causes timing races across multiple files
**Severity:** High  
**Fix Difficulty:** Medium  

**Problem:**  
`useCarouselZustand` calls `init(id)` inside a `useEffect`, which runs *after* the first render. Multiple consumers read from the store before the entry exists:

- **`targetResolver.buildCarouselData`** — reads `carouselStore.getState().get(id)` on pointer-down. If the `useEffect` hasn't fired, `get()` returns `undefined` → crash trying to read `.index` / `.size`.
- **`Carousel.tsx` `setCount` effect** — calls `carouselStore.getState().setCount(id, ...)` which writes to `state.carouselStore[id].count` — throws if the entry doesn't exist.
- **`useCarouselSizing` ResizeObserver** — calls `setSize()` which has the same problem.

The same pattern applies to `dragStore` and `sliderStore` (their `build*Data` in targetResolver have no init guard either).

**Why it matters:**  
A pointer-down on any carousel/slider/drag element before its React component's `useEffect` fires causes an uncaught TypeError. In practice this may be masked by mount ordering, but it's fragile and race-prone.

**Recommended Fix:**  
```ts
// Option A (preferred): Make init synchronous in the hook (see issue #2 fix).
// This guarantees store entry exists before any reads.

// Option B: Add init guards in targetResolver:
buildCarouselData(ctx: Context): CarouselData & CarouselModifiers {
  carouselStore.getState().init(ctx.id)
  const s = carouselStore.getState().get(ctx.id)
  ...
}
// (repeat for buildSliderData, buildDragData)
```

---

### 5. `carouselState.swipe()` drops offset when `delta1D === 0`
**Severity:** High  
**Fix Difficulty:** Easy  

**Problem:**  
```ts
swipe: (desc) => {
  set(state => {
    const offset = desc.solutions.delta1D
    if (offset) state.carouselStore[desc.base.id].offset = offset
    //  ^ falsy check — 0 is treated as "no value"
  })
},
```

The old version used `s.offset = desc.runtime.delta1D ?? s.offset` which correctly treats `0` as a valid value.

**Why it matters:**  
When the user drags back to the exact starting position (`delta = 0`), the offset is never written to `0`. The panel stays at its previous offset instead of centering. Visible as a "stuck" panel that won't return to origin during active drag.

**Recommended Fix:**  
```ts
swipe: (desc) => {
  set(state => {
    const offset = desc.solutions.delta1D
    if (offset !== undefined) state.carouselStore[desc.base.id].offset = offset
  })
},
```

---

### 6. `dragState.swipeStart` sets `dragging = false` instead of `true`
**Severity:** High  
**Fix Difficulty:** Easy  

**Problem:**  
```ts
swipeStart: (desc) => {
  set(state => {
    const s = state.dragStore[desc.base.id]
    s.dragging = false   // ← should be true
    s.offset = { x: 0, y: 0 }
  })
},
```

**Why it matters:**  
Any component subscribing to `dragging` for visual feedback (e.g., disabling transitions, showing drag handles) will never see `true` at drag start. The old version correctly set `dragging = true`.

**Recommended Fix:**  
```ts
s.dragging = true
```

---

## 🟡 Medium Priority Issues

### 7. Pipeline dispatches to stores even when solver rejects (`stateAccepted` guard missing)
**Severity:** Medium  
**Fix Difficulty:** Easy  

**Problem:**  
The old pipeline gated state dispatch:
```ts
if (solution.runtime.stateAccepted && solution.runtime.event && solution.base.type) { ... }
```
The new pipeline always dispatches. When a solver returns `void` (gated/blocked gesture), the store function still runs — triggering immer's `set()` machinery for a no-op on every `pointermove` during a blocked gesture (~60/sec).

**Why it matters:**  
Unnecessary Zustand `set()` calls generate immer structural clones and subscriber notifications with no effect. Minor lag on low-end devices during blocked gestures.

**Recommended Fix:**  
```ts
// pipeline.ts — add before each case:
if (!modDesc.solutions?.stateAccepted) break
```

---

### 8. `carouselState.setSize()` lost equality guard — unnecessary renders from ResizeObserver
**Severity:** Medium  
**Fix Difficulty:** Easy  

**Problem:**  
Old version skipped no-op updates:
```ts
if (s.size.x === trackSize.x && s.size.y === trackSize.y) return
```
New version unconditionally assigns. `ResizeObserver` fires frequently, each call triggers immer `set()` → new object reference → `useShallow` detects change → re-render. Compounded across multiple carousels.

**Why it matters:**  
Unnecessary re-renders during layout events, CSS animations, and orientation changes.

**Recommended Fix:**  
```ts
setSize: (id, trackSize) => {
  set(state => {
    const s = state.carouselStore[id]
    if (s.size.x === trackSize.x && s.size.y === trackSize.y) return
    s.size = trackSize
  })
},
```

---

### 9. `carouselState.setPosition()` lost `pendingDir` guard — wasted settle cycles
**Severity:** Medium  
**Fix Difficulty:** Easy  

**Problem:**  
Every `transitionEnd` event calls `setPosition()`. Without the `pendingDir` null check, it always runs `settling = true` → `rAF` → `settling = false`, producing two Zustand updates and two React re-renders as no-ops. This fires after *every* carousel animation, including snap-backs and reverts.

**Why it matters:**  
Two wasted renders per animation completion. Also introduces a timing window where a new gesture starting between the two frames could read `settling = true` incorrectly.

**Recommended Fix:**  
```ts
setPosition: (id) => {
  const s = get().carouselStore[id]
  if (!s?.pendingDir) return
  set(state => {
    const s = state.carouselStore[id]
    s.settling = true
    s.index = getNextIndex(s.index, s.pendingDir, s.count)
    s.offset = 0
    s.pendingDir = null
  })
  requestAnimationFrame(() => {
    set(state => {
      state.carouselStore[id].settling = false
    })
  })
},
```

---

### 10. `resolveGate` hysteresis lower bound is likely inverted
**Severity:** Medium  
**Fix Difficulty:** Easy  

**Problem:**  
```ts
// Current:
return currentPos < APP_SETTINGS.hysteresis || currentPos > crossSize + APP_SETTINGS.hysteresis
// hysteresis = 5

// This gates (rejects) any touch in the first 5px of the cross-axis track
// and allows touches up to 5px PAST the track edge.
```

The intent of hysteresis is to *expand* the valid zone, not shrink it at one end and expand at the other.

**Why it matters:**  
A 5px strip at the start of the cross-axis is falsely gated (swipes ignored), while a 5px strip past the end is falsely accepted.

**Recommended Fix:**  
```ts
return currentPos < -APP_SETTINGS.hysteresis || currentPos > crossSize + APP_SETTINGS.hysteresis
```

---

## 🟢 Low Priority / Nice-to-Have

### 11. `interpreter.applyGestureUpdate` has no null guard and missing `break`
**Severity:** Low  
**Fix Difficulty:** Easy  

**Problem:**  
No check for whether the gesture exists (`gestures[update.pointerId]` may be undefined). Also missing `break` in the `switch` statement (only one case exists currently, so no functional bug yet).

**Recommended Fix:**  
```ts
function applyGestureUpdate(update: GestureUpdate) {
  const g = gestures[update.pointerId]
  if (!g) return
  switch (g.desc.type) {
    case 'slider': {
      g.desc.solutions.gestureUpdate = {
        ...g.desc.solutions.gestureUpdate,
        ...update,
      }
      break
    }
  }
}
```

---

### 12. `vectorUtils.resolveDirection` — unhandled case and missing zero guard
**Severity:** Low  
**Fix Difficulty:** Easy  

**Problem:**  
- Vec2 delta with a non-`'both'` axis (e.g., `axis = 'horizontal'`) falls through and returns `undefined`.
- Zero-distance Vec2 `{ x: 0, y: 0 }` with `axis = 'both'` returns `{ dir: 'left' }` instead of `undefined`.

**Recommended Fix:**  
```ts
resolveDirection(delta: Vec2 | number, axis: Axis): Direction | undefined {
  if (typeof delta !== "object" && axis !== 'both') {
    return axis === 'horizontal'
      ? { axis, dir: delta > 0 ? 'right' : 'left' }
      : { axis, dir: delta > 0 ? 'down' : 'up' }
  }
  if (typeof delta === "object") {
    const { x, y } = delta
    if (x === 0 && y === 0) return undefined
    return Math.abs(x) >= Math.abs(y)
      ? { axis, dir: x > 0 ? 'right' : 'left' }
      : { axis, dir: y > 0 ? 'down' : 'up' }
  }
}
```

---

### 13. `abortGesture` orphans store state (`dragging` stays `true`)
**Severity:** Low  
**Fix Difficulty:** Medium  

**Problem:**  
When the bridge aborts a gesture (e.g., `disabled` changes mid-swipe), `pipeline.abortGesture` deletes the interpreter gesture but doesn't reset the carousel/drag store's `dragging` flag. `dragging: true` persists → `transition: "none"` stays active until the next gesture's `swipeStart` resets it.

**Why it matters:**  
Edge case. Between abort and next gesture, any programmatic offset change won't animate. Low severity because `swipeStart` always resets `dragging`.

**Recommended Fix:**  
Accept the edge case, or extend `abortGesture` to query the gesture's descriptor type/id and reset the relevant store's transient fields.

---

### 14. `carouselState.setCount` lost `Math.max(0, count)` guard
**Severity:** Low  
**Fix Difficulty:** Easy  

**Recommended Fix:**  
```ts
setCount: (id, count) => {
  set(state => {
    state.carouselStore[id].count = Math.max(0, count)
  })
},
```

---

### 15. Dead code cleanup
**Severity:** Low  
**Fix Difficulty:** Easy  

- `zunstand/stateManager.ts` — entirely commented out. Delete.
- `sizeState.init()` — never executes (guard always returns). Remove or fix.
- `CarouselSolutions.eventChange` — dead field until issue #1 is fixed. Once fixed, remove the old name.
- `Object.freeze()` in `get()` on carousel/drag/slider stores — redundant with immer dev mode freezing. Remove for consistency.

---

### 16. Type guards don't throw in production
**Severity:** Low  
**Fix Difficulty:** Easy  

**Problem:**  
`gestureTypeGuards.ts` assertion functions (`isCarousel`, `isDrag`, etc.) only throw when `VITE_DEBUG === 'true'`. In production, a type mismatch logs a `console.warn` but TypeScript's control flow still narrows the type — downstream code operates on wrongly-typed data.

**Recommended Fix:**  
Either always throw, or convert from `asserts` functions to boolean guards with explicit early returns at call sites.

---

## 🧠 Summary / Strategy

### Key patterns causing issues

1. **Lost guards during migration** — Equality checks (`setSize`), null guards (`pendingDir`), value guards (`Math.max`, `?? s.offset`) were dropped when moving from `stateManager` + generic store to dedicated Zustand stores. These are all quick fixes.

2. **Async initialization gap** — The old `ensure()` pattern guaranteed state existed synchronously before any read. The new `useEffect`-based `init()` creates a one-frame gap where store entries don't exist, causing crashes in `targetResolver` and mandatory fallback renders. Fix by making `init` synchronous in hooks.

3. **Broken event override path** — The old `runtime` object served as both solver output and pipeline dispatch key. The new separation into `base` (interpreter) and `solutions` (solver) is architecturally cleaner but the event-override mechanism was never reconnected. This is the single highest-impact bug.

4. **Copy-paste errors** — `dragState.setConstraints` (Y-axis) and `dragState.swipeStart` (`dragging = false`) are simple typos with outsized impact.

### Suggested order of attack

| Step | Issues | Effort |
|---|---|---|
| 1 | Fix `size: 0` fallback + synchronous init (#2, #4) | 5 min |
| 2 | Fix `dragState` copy-paste bugs (#3, #6) | 2 min |
| 3 | Fix pipeline event routing + solver `eventChange` (#1) | 15 min |
| 4 | Fix `swipe()` truthiness check (#5) | 1 min |
| 5 | Re-add lost guards: `setSize`, `setPosition`, `setCount`, `stateAccepted` (#7–9, #14) | 5 min |
| 6 | Fix `resolveGate` hysteresis (#10) | 1 min |
| 7 | Add null guards and defensive fixes (#11, #12) | 5 min |
| 8 | Clean up dead code (#15) | 5 min |

Steps 1–4 fix all broken functionality. Steps 5–6 fix performance. Steps 7–8 are defensive hardening.
