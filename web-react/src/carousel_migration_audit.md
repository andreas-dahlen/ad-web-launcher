# Carousel Migration Audit — Old → New Version

> **Old/stable:** `frontend/deleteDif/ad-web-launcher/web-react/...`  
> **New/current:** `frontend/ad-web-launcher/web-react/...`  
> **Generated:** 2026-03-30

---

## File Analysis: `carouselState.ts` (Zustand Store)

**New version:** `interaction/zunstand/carouselState.ts`

### Potential Bugs / Vulnerabilities

1. **`swipe()` drops offset when `delta1D === 0` (truthiness bug)**
   ```ts
   // NEW — uses truthiness check:
   const offset = desc.solutions.delta1D
   if (offset) state.carouselStore[desc.base.id].offset = offset
   ```
   If `delta1D` is exactly `0`, the `if (offset)` guard evaluates to `false` and the offset is **never written**. The old version used nullish coalescing (`s.offset = desc.runtime.delta1D ?? s.offset`) which correctly treats `0` as a valid value.

   **Impact:** During a drag, if the finger returns to the exact starting position, the carousel panel stays at its previous offset instead of snapping to center. Visible as a "stuck" panel.

2. **`setPosition()` does not guard against `pendingDir === null`**  
   The old version explicitly checks:
   ```ts
   if (!lane.pendingDir) return false
   ```
   The new version unconditionally sets `settling = true`, calls `getNextIndex` (which safely returns `currentIndex` when direction is null), then clears `pendingDir` and fires a `requestAnimationFrame` to reset `settling`. This means **every `transitionEnd` event** — even for a reverted swipe that snapped back — triggers a needless `settling = true → rAF → settling = false` cycle. Each cycle produces **two extra Zustand state updates and two React re-renders** with no visible effect.

   **Impact:** Wasted renders after every animation, including no-ops. Potential for subtle timing bugs if another gesture starts between the two frames.

3. **`Direction` type changed from string union to discriminated object**  
   Old: `Direction = 'left' | 'right' | 'up' | 'down'`  
   New: `Direction = { axis: 'horizontal'; dir: 'left' | 'right' } | { axis: 'vertical'; dir: 'up' | 'down' } | ...`

   The `getNextIndex` function and all swipe handlers correctly read `direction.dir` in the new version. However, **any call site** in the pipeline or solver layer that still passes a plain string instead of the new object shape would silently fail — `direction.dir` would be `undefined`, and `getNextIndex` would always return `currentIndex`. The carousel would **never advance**.

   **Impact:** If the pipeline produces an old-format direction, carousel navigation completely breaks with no error.

4. **`Object.freeze()` in `get()` is redundant and potentially confusing**  
   Immer already freezes produced state in development mode. Using `Object.freeze` on what is already (in production) a plain mutable reference means consumers calling `get()` outside of immer's `set()` get a frozen object, but consumers inside `set()` (where immer provides a draft) don't. This inconsistency can lead to silent failures if any non-immer code tries to mutate the return value.

### Potential Performance / Lag Issues

1. **`setSize()` unconditionally triggers state update**  
   Old version:
   ```ts
   if (s.size.x === trackSize.x && s.size.y === trackSize.y) return
   s.size = trackSize
   ```
   New version:
   ```ts
   state.carouselStore[id].size = trackSize
   ```
   The `ResizeObserver` callback fires frequently (on any layout shift). Without the equality guard, every callback produces a Zustand update → immer structural clone → React re-render of all subscribers, even when the size hasn't actually changed.

   **Impact:** Unnecessary re-renders on every layout recalculation. Compounded when multiple carousels exist.

2. **`setCount()` lost its `Math.max(0, count)` guard**  
   Not a performance issue per se, but a negative count would cause modular arithmetic to behave unexpectedly in `getNextIndex`, potentially producing negative indices.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Architecture | Generic reactive store + `stateManager` facade | Dedicated Zustand store per type |
| `Direction` type | Plain string (`'left'`) | Object (`{ axis, dir }`) |
| `setSize` guard | Equality check prevents no-op writes | No guard |
| `setCount` guard | `Math.max(0, count)` | None |
| `swipe` offset write | `desc.runtime.delta1D ?? s.offset` (null-safe) | `if (offset)` (falsy = dropped) |
| `setPosition` guard | `if (!lane.pendingDir) return false` | None |
| `ensure` vs `init` | Synchronous, returns state | Synchronous, but called from `useEffect` (async) |

### Suggested Fixes / Explanations

1. **Fix `swipe()` truthiness bug:**
   ```ts
   swipe: (desc) => {
     set(state => {
       const offset = desc.solutions.delta1D
       if (offset !== undefined) state.carouselStore[desc.base.id].offset = offset
     })
   },
   ```

2. **Re-add `pendingDir` guard to `setPosition()`:**
   ```ts
   setPosition: (id) => {
     const s = get().carouselStore[id]
     if (!s?.pendingDir) return  // ← add this guard
     set(state => { ... })
     requestAnimationFrame(...)
   },
   ```

3. **Re-add equality check to `setSize()`:**
   ```ts
   setSize: (id, trackSize) => {
     set(state => {
       const s = state.carouselStore[id]
       if (s.size.x === trackSize.x && s.size.y === trackSize.y) return
       s.size = trackSize
     })
   },
   ```

4. **Re-add `Math.max` to `setCount()`:**
   ```ts
   setCount: (id, count) => {
     set(state => {
       state.carouselStore[id].count = Math.max(0, count)
     })
   },
   ```

---

## File Analysis: `useCarouselZustand.ts` (Zustand Hook)

**New version:** `components/primitives/carousel/hooks/useCarouselZustand.ts`

### Potential Bugs / Vulnerabilities

1. **CRITICAL: Fallback `size` is `0` (number) instead of `{ x: 0, y: 0 }` (Vec2)**
   ```ts
   return carouselStore(
     useShallow(s => s.carouselStore[id] ?? {
       index: 0,
       count: 0,
       offset: 0,
       dragging: false,
       size: 0,          // ← BUG: should be { x: 0, y: 0 }
       settling: false
     })
   )
   ```
   When the carousel hasn't been initialized yet (first render, before `useEffect` runs `init`), this fallback is returned. In `Carousel.tsx`:
   ```ts
   const laneSize = axis === "horizontal" ? size.x : size.y
   ```
   `(0).x` is `undefined`, so `laneSize` becomes `undefined`. This propagates into `useCarouselMotion` → `styleForRole` where `multiplier * undefined + delta` produces `NaN`, and CSS `translate3d(NaNpx, 0, 0)` is an **invalid transform** — the browser ignores it entirely.

   **Impact:** On first render (before init completes), all scene panels may render at position 0,0 stacked on top of each other, causing a visual flash/flicker before the real layout kicks in.

2. **`init` runs in `useEffect` — state doesn't exist on first render**  
   The old version called `ensure()` synchronously inside the `subscribe.useFull()` / `subscribe.usePartial()` hooks, meaning state was guaranteed to exist before the component's first render cycle read it. The new `useEffect(() => { carouselStore.getState().init(id) }, [id])` runs **after** the first render. This creates a mandatory two-render startup: render with fallback → effect runs init → state changes → re-render with real data.

   **Impact:** Every carousel mount goes through a guaranteed "flash" frame where fallback values are rendered. Combined with the `size: 0` bug above, this means a visible glitch on mount.

3. **Missing `pendingDir` in fallback object**  
   While `pendingDir` isn't directly consumed by the component render path, the fallback shape doesn't match the `Carousel` type shape. If any downstream code destructures `pendingDir` from the hook result, it gets `undefined` instead of `null`.

### Potential Performance / Lag Issues

1. **`useShallow` on the entire carousel object**  
   `useShallow` performs a shallow equality comparison on the returned object's top-level keys. Since `size` is a `Vec2` object, any `setSize` call produces a new `size` reference even if the values are identical (because immer always creates new objects within `set()`). This means `useShallow` will **always** detect a change when `setSize` is called, triggering a re-render even if x/y haven't changed — reinforcing the need for the equality guard in `setSize()` mentioned above.

### Suggested Fixes / Explanations

1. **Fix the `size` fallback:**
   ```ts
   return carouselStore(
     useShallow(s => s.carouselStore[id] ?? {
       index: 0,
       count: 0,
       offset: 0,
       dragging: false,
       size: { x: 0, y: 0 },  // ← fix
       settling: false,
       pendingDir: null         // ← add for completeness
     })
   )
   ```

2. **Consider synchronous initialization** to avoid the two-render flash:
   ```ts
   export const useCarouselZustand = (id: string) => {
     // Synchronous init — guarantees state exists before first selector run
     carouselStore.getState().init(id)

     return carouselStore(
       useShallow(s => s.carouselStore[id])
     )
   }
   ```
   Since `init` already has an `if (get().carouselStore[id]) return` guard, calling it synchronously outside `useEffect` is idempotent and safe. It avoids the flash frame entirely.

---

## File Analysis: `Carousel.tsx` (Component)

**New version:** `components/primitives/carousel/Carousel.tsx`

### Potential Bugs / Vulnerabilities

1. **`laneSize` is `NaN` on first render** (downstream of `useCarouselZustand` bug)
   ```ts
   const laneSize = axis === "horizontal" ? size.x : size.y
   ```
   If `size` is `0` (the fallback bug), both `size.x` and `size.y` are `undefined`, producing `laneSize = undefined`. All subsequent transform calculations in `useCarouselMotion` produce NaN transforms.

2. **`setCount` called via `getState()` without guaranteeing store entry exists**
   ```ts
   carouselStore.getState().setCount(id, scenes.length)
   ```
   This works, but because `setCount` has no guard for the store entry not existing (it directly indexes `state.carouselStore[id].count`), calling `setCount` before `init` completes would throw. Since both `init` and `setCount` are in `useEffect` hooks, their execution order depends on component tree ordering. If `useCarouselZustand`'s `useEffect` (which calls `init`) hasn't fired before `Carousel`'s `useEffect` (which calls `setCount`), you get a crash.

   **Impact:** Potential race between `init` and `setCount` effects. Currently likely works because both are in the same component and effects fire top-to-bottom, but fragile.

3. **Removed `setCurrentScenes` call**  
   The old version tracked which scene indices were active:
   ```ts
   useEffect(() => {
     carouselStateFn.setCurrentScenes(id, slots.map(s => s.sceneIdx))
   }, [id, slots])
   ```
   The new version comments this out. If any other part of the system depends on `currentScenes` (e.g., lazy loading, prefetching, analytics), it will see stale data. The `scenes` field was also removed from the store type.

### Potential Performance / Lag Issues

1. **Subscribing to the full carousel state object**
   ```ts
   const { settling, index, offset, count, dragging, size } = useCarouselZustand(id)
   ```
   During a drag, `offset` changes on every pointer-move event. Since the component subscribes to the full state object, every offset change triggers a **full component re-render**, including re-computing `slots`, `renderSlots`, `augmentedScenes` (all memoized, so these are cheap), and — critically — re-running `useCarouselMotion` which recomputes `styleForRole` and the transition.

   In the old version, this was the same pattern (`subscribe.useFull`), so this isn't a regression — but worth noting that a more selective subscription (e.g., subscribing only to `offset` for motion, `index` for scenes) could reduce render work during drags.

### Relevant Differences from Old Version

- `subscribe.useFull('carousel', id)` → `useCarouselZustand(id)` with fallback values
- `carouselStateFn.setCount(...)` (synchronous ensure) → `carouselStore.getState().setCount(...)` (no ensure, depends on init)
- `setCurrentScenes` removed
- `lockPrevAt` / `lockNextAt` still passed as data attributes but no longer stored in state

### Suggested Fixes / Explanations

1. Guard `setCount` against missing store entry, or ensure `init` is synchronous (see `useCarouselZustand` fix above).
2. If `currentScenes` is needed elsewhere, re-add the tracking or document its removal.

---

## File Analysis: `useCarouselMotion.ts` (Motion Hook)

**New version:** `components/primitives/carousel/hooks/useCarouselMotion.ts`

### Potential Bugs / Vulnerabilities

1. **No functional bugs specific to this file** — it is nearly identical between old and new versions. The only change is the store import (`carouselStateFn` → `carouselStore.getState()`).

2. **`onTransitionEnd` calls `setPosition` which lacks the `pendingDir` guard** (upstream bug)  
   When a swipe is reverted (offset animates back to 0), `transitionEnd` fires, `setPosition` is called, and without the `pendingDir` guard, it triggers a useless `settling = true → rAF → settling = false` cycle.

### Potential Performance / Lag Issues

1. **`styleForRole` creates a new object on every call**  
   Each call to `styleForRole(role)` spreads `BASE_STYLE` into a new object. Since this is called 3 times per render (prev, current, next), it creates 3 new style objects every render. During a rapid drag (pointer-move → new offset → re-render), this means 3 new style objects ~60 times per second.

   **Impact:** Minor GC pressure. Not likely the cause of visible lag, but could be micro-optimized if needed.

2. **`useCallback` dependencies include `transition`** which changes when `isDragging`/`isSettling` changes. Combined with full-state subscription, `styleForRole` is rebuilt on every frame during drag (because `delta` changes on every pointer-move, which changes the `useCallback` deps).

### Relevant Differences from Old Version

- Import changed from `carouselStateFn` to `carouselStore.getState()` — functionally equivalent.
- No other changes.

---

## File Analysis: `useCarouselSizing.ts` (Sizing Hook)

**New version:** `components/primitives/carousel/hooks/useCarouselSizing.ts`

### Potential Bugs / Vulnerabilities

1. **`setSize` called without checking if store entry exists**
   ```ts
   carouselStore.getState().setSize(id, trackSize)
   ```
   If the ResizeObserver fires before `init` has been called (which is in a separate `useEffect`), `state.carouselStore[id]` is `undefined`, and `state.carouselStore[id].size = trackSize` throws a TypeError.

   **Impact:** Same timing race as `setCount`. The ResizeObserver callback and the `init` effect can race.

### Potential Performance / Lag Issues

1. **Every ResizeObserver callback triggers a Zustand state update** (no equality guard in `setSize` — see carouselState analysis above). Especially wasteful during CSS animations that cause layout shifts.

### Relevant Differences from Old Version

- Old: `state.setSize("carousel", id, trackSize)` → calls through `stateManager` → `carouselStateFn.setSize()` → has equality guard.
- New: `carouselStore.getState().setSize(id, trackSize)` → no equality guard.

---

## File Analysis: `useCarouselScenes.ts` (Scene Assignment)

**New version:** `components/primitives/carousel/hooks/useCarouselScenes.ts`

### Analysis

This file is **identical** between old and new versions and is **not used** by the new `Carousel.tsx` (which inlines the scene slot logic). No issues.

---

## Summary of Main Issues Across Files

### Critical Bugs

| # | Issue | File(s) | Severity |
|---|---|---|---|
| 1 | **Fallback `size: 0` instead of `{ x: 0, y: 0 }`** causes `NaN` transforms on first render | `useCarouselZustand.ts` → `Carousel.tsx` → `useCarouselMotion.ts` | **High** |
| 2 | **`swipe()` truthiness check drops `delta1D === 0`** — offset never resets to zero during drag | `carouselState.ts` | **Medium** |
| 3 | **`init` in `useEffect` creates timing race** — `setCount` and `setSize` can fire before store entry exists | `useCarouselZustand.ts`, `Carousel.tsx`, `useCarouselSizing.ts` | **Medium** |

### Performance Issues

| # | Issue | File(s) | Impact |
|---|---|---|---|
| 4 | **`setSize()` lost equality guard** — ResizeObserver triggers unnecessary Zustand updates + re-renders | `carouselState.ts`, `useCarouselSizing.ts` | Moderate |
| 5 | **`setPosition()` lost `pendingDir` guard** — no-op transitions trigger 2 wasted state updates + renders | `carouselState.ts`, `useCarouselMotion.ts` | Low–Moderate |
| 6 | **Two-render mount cycle** — `useEffect`-based init guarantees a flash frame with fallback values | `useCarouselZustand.ts` | Low |

### Recommended Fix Priority

1. **Fix `size: 0` fallback** → immediate, prevents NaN transforms
2. **Fix `swipe()` truthiness check** → `if (offset !== undefined)` or use `??`
3. **Make `init` synchronous** (outside `useEffect`) → eliminates timing race and flash frame
4. **Re-add `setSize` equality guard** → prevents unnecessary renders
5. **Re-add `setPosition` pendingDir guard** → prevents wasted animation-end cycles
6. **Re-add `Math.max(0, count)` in `setCount`** → defensive, low cost
