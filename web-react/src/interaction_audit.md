# Interaction Folder — Diagnostic Audit

> **Old/stable:** `frontend/deleteDif/ad-web-launcher/web-react/src/interaction/...`  
> **New/current:** `frontend/ad-web-launcher/web-react/src/interaction/...`  
> **Generated:** 2026-03-30

---

## File Analysis: `core/pipeline.ts`

**New version:** `interaction/core/pipeline.ts`

### Potential Bugs / Vulnerabilities

1. **CRITICAL: Solver event override is completely broken — `swipeRevert` is dead code**

   In the **old version**, the solver could override the event type (e.g., turning `swipeCommit` into `swipeRevert`), and the pipeline read from the merged result:
   ```ts
   // OLD: solver result merges into runtime → runtime.event = 'swipeRevert'
   solution = { ...descriptor, runtime: { ...descriptor.runtime, ...solverResult } }
   // Then pipeline dispatches based on:
   const fn = state[solution.runtime.event]
   ```

   In the **new version**, the solver result merges into `solutions`, but the pipeline reads `base.event` — which is **never overwritten by the solver**:
   ```ts
   // NEW: solver result merges into solutions only
   modDesc = { ...baseDesc, solutions: { ...baseDesc.solutions, ...solverResult } }
   // But pipeline dispatches based on:
   const { base: { event: modEvent } } = modDesc  // ← always the interpreter's event
   const fn = state[modEvent as keyof CarouselFunctions]
   ```

   **The full failure chain for a rejected carousel swipe:**
   1. User lifts finger → interpreter sets `base.event = 'swipeCommit'`
   2. `carouselSolver.swipeCommit` decides to revert → returns `{ event: 'swipeRevert', stateAccepted: true }`
   3. Merged into `solutions.event` (BUT nobody reads `solutions.event`)
   4. Pipeline reads `base.event` = `'swipeCommit'` → dispatches `carouselStore.swipeCommit()`
   5. `swipeCommit` in the store: `pendingDir = null` (no direction from solver), `offset = s.offset` (unchanged), `dragging = false`
   6. CSS transition enables but offset hasn't changed → **no animation, panels stuck at drag position**
   7. `swipeRevert` (which resets `offset = 0`) is **never called**

   **Impact:** Any carousel swipe that doesn't meet the commit threshold leaves panels stuck at the partial drag position. The carousel becomes visually broken after any rejected swipe.

2. **`stateAccepted` guard is missing — all solver results trigger state mutations**

   Old version:
   ```ts
   if (solution.runtime.stateAccepted && solution.runtime.event && solution.base.type) { ... }
   ```
   New version has no such guard — the `switch` statement always dispatches:
   ```ts
   switch (modType) {
     case 'carousel': {
       const state = carouselStore.getState()
       const fn = state[modEvent as keyof CarouselFunctions]
       fn?.(modDesc)  // always called, even if stateAccepted === false
       break
     }
   ```

   When solvers return `void` (e.g., carousel gated/blocked), `solverResult` is `undefined`, so `modDesc = baseDesc` unchanged with `solutions.stateAccepted = false`. The state function still gets called.

   **Impact:** Every gated/blocked swipe event (pointer-move during a blocked gesture) triggers a useless Zustand `set()` → immer overhead → empty state produce. This happens on every high-frequency `pointermove` during blocked gestures. The store function is effectively a no-op (offset stays unchanged), but the Zustand machinery still runs.

3. **`CarouselSolutions.eventChange` is dead — never read anywhere**

   The `CarouselSolutions` type defines `eventChange?: string`, but:
   - The solver writes `event` (not `eventChange`) — likely a copy-paste from the old `RuntimePatch`
   - The pipeline never reads `eventChange` or `solutions.event`
   - This is a dead field with no consumer

### Potential Performance / Lag Issues

1. **Every solver `void` return still triggers store dispatch** (see bug #2 above). During rapid pointer-move events on a gated/blocked gesture, this means ~60 useless Zustand `set()` calls per second.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Event routing | `solution.runtime.event` (solver can override) | `modDesc.base.event` (solver override ignored) |
| State accepted guard | `if (stateAccepted && event && type)` | None — always dispatches |
| State dispatch | Generic: `state[event](type, desc)` via stateManager | Switch/case per type, direct store access |
| Pointer ID | Not tracked in pipeline | Tracked in `PointerEventPackage` |
| Solver result merges into | `runtime` (overrides event) | `solutions` (event isolated) |

### Suggested Fixes / Explanations

1. **Fix event routing — read solver's event override from solutions:**
   ```ts
   // After solver merge:
   const resolvedEvent = modDesc.solutions?.eventChange ?? modDesc.base.event
   // Use resolvedEvent for dispatch and renderer:
   const fn = state[resolvedEvent as keyof CarouselFunctions]
   ```
   And update the carousel solver to use `eventChange` instead of `event`:
   ```ts
   return { eventChange: 'swipeRevert', stateAccepted: true }
   ```

2. **Re-add `stateAccepted` guard:**
   ```ts
   if (!modDesc.solutions?.stateAccepted) break
   ```

---

## File Analysis: `core/interpreter.ts`

**New version:** `interaction/core/interpreter.ts`

### Potential Bugs / Vulnerabilities

1. **`applyGestureUpdate` has no null check — will crash if gesture doesn't exist**
   ```ts
   function applyGestureUpdate(update: GestureUpdate) {
       const g = gestures[update.pointerId]
       switch (g.desc.type) {  // ← g is undefined if gesture was deleted/expired
   ```
   Old version:
   ```ts
   if (!gesture.desc) return
   ```

   **Impact:** If `applyGestureUpdate` is called with a stale `pointerId` (e.g., after gesture cleanup), it throws a TypeError. This could occur if the slider gestureUpdate pipeline fires after the gesture has been finalized.

2. **Missing `break` in `applyGestureUpdate` switch statement**
   ```ts
   switch (g.desc.type) {
       case 'slider': {
           g.desc.solutions.gestureUpdate = { ... }
       }  // ← no break
   }
   ```
   Only one case currently exists, so there's no functional bug. But if additional cases are added later, fall-through would silently occur.

3. **Descriptor mutation could produce stale solver data**

   The interpreter stores the descriptor at gesture start and mutates it on each move:
   ```ts
   g.desc.base.delta = utils.normalizedDelta(g.totalDelta) ?? g.desc.base.delta
   g.desc.base.event = 'swipe'
   return g.desc
   ```
   The `data` field (containing `index`, `size`, etc.) is read from the store at construction time and never refreshed during the gesture. If another gesture or side effect changes carousel state mid-swipe, the solver works with the stale construction-time data.

   This was the same in the old version, so it's **not a regression** — but worth noting as a latent issue.

### Potential Performance / Lag Issues

1. No significant performance issues. The multi-pointer gesture map is more efficient than the old single-gesture singleton for concurrent interactions.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Gesture tracking | Single `gesture` object (one pointer at a time) | `gestures: Record<number, GestureState>` (multi-pointer) |
| Cleanup | `resetGesture()` zeroes fields | `delete gestures[pointerId]` removes entry |
| `applyGestureUpdate` | Guards: `if (!gesture.desc) return` | No guard — crashes on missing gesture |
| Abort mechanism | None (relied on fake 'up' event) | `deleteGesture(pointerId)` exposed via pipeline |

### Suggested Fixes / Explanations

1. **Add null guard to `applyGestureUpdate`:**
   ```ts
   function applyGestureUpdate(update: GestureUpdate) {
       const g = gestures[update.pointerId]
       if (!g) return
       switch (g.desc.type) { ... }
   }
   ```

---

## File Analysis: `core/intentUtils.ts`

**New version:** `interaction/core/intentUtils.ts`

### Potential Bugs / Vulnerabilities

1. **`resolveAxis` lost generic `target?.base.axis` null check**

   Old:
   ```ts
   resolveAxis(intentAxis: Axis, target?: Descriptor): Axis | null {
       if (!target?.base.axis) return null
       if (target.data?.locked) return null
   ```
   New:
   ```ts
   resolveAxis(intentAxis: Axis, target: Descriptor): Axis | null {
       if (target.type == 'button') return null
       if (target.type == 'drag' && target.data.locked) return null
       if (target.base.axis === 'both') { return 'both' }
   ```

   The new version uses the discriminated union properly (checking `target.type`), but removes the `target?.base.axis` null guard. If `target.base.axis` is undefined/null (which could happen with a malformed data attribute), the function would fall through to `return null` at the end. This is functionally correct but less defensive than the old version.

2. **`swipeThresholdCalc` type signature change**

   Old: `desc?.base.type === 'slider'`  
   New: `desc.type === 'slider'`

   Both are correct for their respective descriptor shapes. No bug.

### Potential Performance / Lag Issues

No issues.

### Relevant Differences from Old Version

- Type-based dispatch now uses the discriminated union `desc.type` instead of `desc.base.type`
- `resolveAxis` locks only apply to drag type, not generically — correct narrowing via new type system
- `resolveTarget` now passes `pointerId` to `targetResolver.findTargetInDom`

### Suggested Fixes / Explanations

No fixes needed. The changes are clean structural improvements.

---

## File Analysis: `core/targetResolver.ts`

**New version:** `interaction/core/targetResolver.ts`

### Potential Bugs / Vulnerabilities

1. **`buildCarouselData` reads from store with no initialization guard — potential crash**
   ```ts
   buildCarouselData(ctx: Context): CarouselData & CarouselModifiers {
       const s = carouselStore.getState().get(ctx.id)
       // s is Object.freeze(get().carouselStore[id]) — could be undefined
       const lockSwipeAt = { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
       return { index: s.index, size: s.size, lockSwipeAt }
       // If s is undefined → TypeError: Cannot read properties of undefined
   }
   ```

   Old version routed through `stateManager` → `ensure()` which auto-initialized:
   ```ts
   const index = state.getCurrentIndex(type, id)  // → ensure(id).index
   const size = state.getSize(type, id)            // → ensure(id).size
   ```

   **Impact:** If a carousel element is in the DOM but its Zustand store entry hasn't been initialized (e.g., the `useEffect` calling `init` hasn't fired yet), the first pointer-down on that element crashes.

   Same issue applies to `buildSliderData` and `buildDragData`.

2. **`lockSwipeAt` always constructed, even when no locks exist**

   Old version:
   ```ts
   const lockSwipeAt = ctx.lockPrevAt != null && ctx.lockNextAt != null
       ? { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
       : undefined
   ```
   New version:
   ```ts
   const lockSwipeAt = { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
   ```

   This always creates the `lockSwipeAt` object even when both values are `null`. The downstream `carouselSolver` checks:
   ```ts
   const locked = desc.data.lockSwipeAt
       ? utils.isCarouselBlocked(...)
       : null
   ```
   Since `lockSwipeAt` is always truthy (it's an object), `isCarouselBlocked` is always called. Inside, it checks `if (prev == null && next == null) return false`, so functionally it's equivalent — but it runs unnecessary code on every swipe event.

### Potential Performance / Lag Issues

1. **`findTargetInDom` calls `document.elementsFromPoint(x, y)` on every pointer-down** — this queries the entire rendering tree. Standard DOM API, but worth noting that deep DOM trees make this more expensive.

   Same as old version — not a regression.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Descriptor construction | Generic builder → `base.type` + flat `data` + `runtime` | Discriminated union builders → `type` + typed `data` + `solutions` |
| State access | Via `stateManager.ensure()` (auto-init) | Direct `store.getState().get()` (no ensure) |
| Lock modifier | Only constructed when both values are non-null | Always constructed |
| Button construction | Same generic path | Dedicated `buildButton` builder |

### Suggested Fixes / Explanations

1. **Add initialization guard to `build*Data` methods:**
   ```ts
   buildCarouselData(ctx: Context): CarouselData & CarouselModifiers {
       carouselStore.getState().init(ctx.id)  // ensure existence
       const s = carouselStore.getState().get(ctx.id)
       ...
   }
   ```
   Or check for undefined and return defaults.

2. **Optionally restore conditional `lockSwipeAt` construction** to avoid unnecessary `isCarouselBlocked` calls.

---

## File Analysis: `bridge/bridge.ts`

**New version:** `interaction/bridge/bridge.ts`

### Potential Bugs / Vulnerabilities

1. **`abortGesture` orphans carousel state — `dragging` stays `true`**

   When `disabled` changes to `true` mid-gesture:
   ```ts
   pipeline.abortGesture(activePointerId.current) // just deletes from gestures map
   ```
   This cleans up the interpreter's gesture state but does NOT notify the carousel/slider/drag store. So if a carousel was mid-swipe, `dragging: true` persists in the Zustand store.

   Old version sent a fake `'up'` event:
   ```ts
   pipeline.orchestrate({ eventType: 'up', x: 0, y: 0 })
   ```
   This was a hack (wrong coordinates), but it at least triggered the state cleanup path.

   **Impact:** After an abort, `dragging: true` means `transition = "none"` stays active on the carousel. The next gesture will still work (swipeStart resets dragging), but between abort and next gesture, any offset transitions are disabled. Edge case, low severity.

### Potential Performance / Lag Issues

1. **`onReaction` ref pattern is a good performance improvement**

   Old version had `onReaction` in the `useEffect` dependency array:
   ```ts
   useEffect(() => { ... }, [elRef, onReaction, disabled])
   ```
   This caused all pointer listeners to be torn down and re-registered on every render where `onReaction` was a new closure (i.e., every render of the parent component).

   New version stores `onReaction` in a ref:
   ```ts
   const onReactionRef = useRef(onReaction)
   useEffect(() => { onReactionRef.current = onReaction }, [onReaction])
   ```
   Listener registration depends only on `[elRef, disabled]`. **Good change.**

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Abort behavior | Fake 'up' event at (0,0) | `pipeline.abortGesture(pointerId)` (clean, no state cleanup) |
| onReaction stability | In useEffect deps → re-registers listeners | Ref-based → stable listeners |
| Pointer ID | Not forwarded to pipeline | Passed through in `PointerEventPackage` |

### Suggested Fixes / Explanations

1. **For `abortGesture`, also clean up store state:**
   ```ts
   // In bridge or pipeline:
   abortGesture(pointerId: number) {
       const g = interpreter.getGesture?.(pointerId)
       if (g?.desc) {
           // Reset the relevant store's transient state
           // e.g., set dragging=false, offset=0
       }
       interpreter.deleteGesture(pointerId)
   }
   ```
   Or accept the minor edge case.

---

## File Analysis: `solvers/carouselSolver.ts`

**New version:** `interaction/solvers/carouselSolver.ts`

### Potential Bugs / Vulnerabilities

1. **CRITICAL: Returns `event: 'swipeRevert'` which is NOT a valid field on `CarouselSolutions` and is NOT read by the pipeline**

   ```ts
   // CarouselSolutions type:
   type CarouselSolutions = {
       stateAccepted: boolean
       delta1D?: number
       eventChange?: string  // ← the field name is eventChange
       direction?: Direction
   }

   // But the solver writes:
   return { event: 'swipeRevert', stateAccepted: true }
   //       ^^^^^ wrong property name AND pipeline never reads it
   ```

   This is the solver-side of the critical pipeline bug described above. Even if the pipeline were fixed to read from `solutions`, it would need to look for `eventChange` not `event`.

   **Impact:** Carousel swipe revert is completely non-functional. See pipeline analysis for full failure chain.

2. **`swipe` handler returns void for gated/locked cases — old version returned `{ stateAccepted: false }`**

   Old:
   ```ts
   if (gated || locked) { return { stateAccepted: false } }
   ```
   New:
   ```ts
   if (gated || locked) return  // void
   ```

   Functionally similar (pipeline doesn't check `stateAccepted` anymore), but the intent is different. In the old version, `stateAccepted: false` explicitly told the pipeline "do not dispatch to state." In the new version, the pipeline dispatches regardless.

### Potential Performance / Lag Issues

No significant issues beyond the pipeline-level wasted dispatch for void returns.

### Relevant Differences from Old Version

- Type guards: Old used `descriptor as CarouselDescriptor`. New uses `isCarousel(desc)` assertion function.
- Return type: Old `RuntimePatch`. New `CarouselSolutions`.
- `event` field: Old correctly overwrote `runtime.event`. New writes to wrong field name on wrong object.

### Suggested Fixes / Explanations

1. **Replace `event` with `eventChange` in all return statements:**
   ```ts
   return { eventChange: 'swipeRevert', stateAccepted: true }
   ```
   **AND** fix the pipeline to read `solutions.eventChange` (see pipeline fix).

---

## File Analysis: `solvers/dragSolver.ts`

**New version:** `interaction/solvers/dragSolver.ts`

### Potential Bugs / Vulnerabilities

1. **No significant bugs.** The structural changes are clean.

2. **`resolveDragDirection` now takes an `axis` parameter**

   Old: `utils.resolveDragDirection(desc.data.position, value)`  
   New: `utils.resolveDragDirection(desc.base.axis, desc.data.position, value)`

   This is correct — the new `vectorUtils.resolveDirection` requires an explicit axis to produce the new `Direction` object type. The value propagates correctly.

### Potential Performance / Lag Issues

No issues.

### Relevant Differences from Old Version

- Type assertion: Old used `descriptor as DragDescriptor`. New uses `isDrag(desc)` assertion function.
- Added `axis` parameter to `resolveDragDirection` call.

### Suggested Fixes / Explanations

No fixes needed.

---

## File Analysis: `solvers/sliderSolver.ts`

**New version:** `interaction/solvers/sliderSolver.ts`

### Potential Bugs / Vulnerabilities

1. **`swipeStart` now includes `pointerId` in `gestureUpdate`**

   Old:
   ```ts
   gestureUpdate: { sliderStartOffset: result?.value, sliderValuePerPixel: result?.valuePerPixel }
   ```
   New:
   ```ts
   gestureUpdate: {
       pointerId: desc.base.pointerId,
       sliderStartOffset: result?.value,
       sliderValuePerPixel: result?.valuePerPixel
   }
   ```

   This is needed for the new multi-pointer interpreter. Correct change.

2. **No other bugs.** The slider solver is structurally unchanged.

### Potential Performance / Lag Issues

No issues.

### Relevant Differences from Old Version

- Type assertion: `descriptor as SliderDescriptor` → `isSlider(desc)` assertion function.
- `gestureUpdate` now includes `pointerId`.

### Suggested Fixes / Explanations

No fixes needed.

---

## File Analysis: `solvers/solverUtils.ts`

**New version:** `interaction/solvers/solverUtils.ts`

### Potential Bugs / Vulnerabilities

1. **`resolveGate` now uses hysteresis instead of raw boundary check**

   Old: `currentPos < 0 || currentPos > crossSize`  
   New: `currentPos < APP_SETTINGS.hysteresis || currentPos > crossSize + APP_SETTINGS.hysteresis`

   This is an intentional improvement. The hysteresis value (5px) creates a buffer zone at the edges of the cross-axis track, preventing accidental gate triggers from slight jitter near the boundary.

   **However:** The gate now allows interaction slightly outside the track bounds (up to `hysteresis` pixels past the edge). If this is problematic, the formula should be:
   ```ts
   currentPos < -APP_SETTINGS.hysteresis || currentPos > crossSize + APP_SETTINGS.hysteresis
   ```
   Currently `< hysteresis` means the gate triggers at 5px from the top/left edge, which cuts off a valid 5px strip at the start of the track.

   **Impact:** A 5px strip at the beginning of the cross-axis track is incorrectly gated (treated as out-of-bounds), while a 5px strip past the end is incorrectly allowed. Likely inverted sign on the `hysteresis` for the lower bound.

2. **`getCommitOffset` changed from string comparison to object property access**

   Old: `if (direction === 'right' || direction === 'down') return laneSize`  
   New: `if (direction.dir === 'right' || direction.dir === 'down') return laneSize`

   Correct for the new `Direction` type.

3. **`resolveSliderSwipe` now reads `gestureUpdate` from `solutions` instead of `runtime`**

   Old:
   ```ts
   const { sliderValuePerPixel, sliderStartOffset } = desc.runtime
   ```
   New:
   ```ts
   const update = desc.solutions?.gestureUpdate
   const pixel = update.sliderValuePerPixel
   const offset = update.sliderStartOffset
   ```

   The `gestureUpdate` is initially set in `solutions` by the solver and then also stored in the interpreter's gesture state via `applyGestureUpdate`. On subsequent swipe events, the interpreter returns the descriptor with `solutions.gestureUpdate` already populated from the gesture state. This works correctly.

4. **`normalize1D` now properly rejects `axis == 'both'`**

   Old: `if (!axis) return {}`  
   New: `if (axis == 'both') return {}`

   These are functionally different. Old version rejected null/undefined axis. New version rejects 'both' axis. Since 'both' is used by drag (which doesn't call `normalize1D`), and carousel/slider always have a strict axis, this is correct.

### Potential Performance / Lag Issues

No issues.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Gate check | `< 0`, `> crossSize` | `< hysteresis`, `> crossSize + hysteresis` |
| Direction access | String comparison | `direction.dir` property access |
| normalize1D guard | `!axis` (null check) | `axis == 'both'` (specific exclusion) |
| Slider gestureUpdate | From `desc.runtime` | From `desc.solutions?.gestureUpdate` |

### Suggested Fixes / Explanations

1. **Fix hysteresis lower bound (likely inverted):**
   ```ts
   resolveGate(norm: Normalized1D) {
       const currentPos = (norm.crossOffset ?? 0) + (norm.crossDelta ?? 0)
       const crossSize = norm.crossTrackSize ?? 0
       return currentPos < -APP_SETTINGS.hysteresis || currentPos > crossSize + APP_SETTINGS.hysteresis
   },
   ```

---

## File Analysis: `solvers/vectorUtils.ts`

**New version:** `interaction/solvers/vectorUtils.ts`

### Potential Bugs / Vulnerabilities

1. **`resolveDirection` has an unhandled case — Vec2 delta with non-`'both'` axis returns `undefined`**

   ```ts
   resolveDirection(delta: Vec2 | number, axis: Axis): Direction | undefined {
       // Case 1: number + non-both axis → handled
       if (typeof delta !== "object" && axis !== 'both') { ... }
       // Case 2: Vec2 + 'both' axis → handled
       if (typeof delta == "object" && axis == 'both') { ... }
       // MISSING: Vec2 + non-both axis → falls through to implicit undefined
   }
   ```

   Old version handled this via a different structure:
   ```ts
   if (axis) {
       // handles any delta with a specific axis
       if (typeof delta !== "object") return '...'
   }
   // handles any Vec2 without specific axis
   if (typeof delta == "object") { ... }
   ```

   **Impact:** If `resolveDragDirection` is called with a Vec2 delta and a non-`'both'` axis (e.g., a drag element with `data-axis="horizontal"`), direction would be `undefined`. The drag solver would then not report a direction. Low severity — drags typically use `axis = 'both'`.

2. **Missing zero-delta guard for Vec2 case**

   Old version: `if (x === 0 && y === 0) return undefined`  
   New version: No guard. A zero-distance Vec2 delta produces `{ axis: 'both', dir: 'left' }` because `Math.abs(0) >= Math.abs(0)` is true and `0 > 0` is false.

   **Impact:** A drag commit with zero movement reports direction `'left'` instead of `undefined`. Minor — zero-distance commits are rare.

3. **`resolveByAxis1D` now properly excludes `'both'` via TypeScript**

   Old: Accepted any `Axis`, returned `undefined` fields silently for `'both'`  
   New: `Exclude<Axis, 'both'>` — compile-time prevention. Better type safety.

### Potential Performance / Lag Issues

No issues.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| `resolveDirection` return | Plain string `'left'` | Object `{ axis, dir: 'left' }` |
| `resolveByAxis1D` axis | Accepts all, silently undefined for 'both' | Excludes 'both' at type level |
| Zero-delta handling | Returns `undefined` | Returns arbitrary direction `'left'` |
| Unhandled case | None | Vec2 + non-'both' axis |

### Suggested Fixes / Explanations

1. **Add the missing case to `resolveDirection`:**
   ```ts
   resolveDirection(delta: Vec2 | number, axis: Axis): Direction | undefined {
       if (typeof delta !== "object" && axis !== 'both') {
           return axis === 'horizontal'
               ? ({ axis, dir: delta > 0 ? 'right' : 'left' })
               : ({ axis, dir: delta > 0 ? 'down' : 'up' })
       }
       if (typeof delta === "object") {
           const { x, y } = delta
           if (x === 0 && y === 0) return undefined
           const resolvedAxis = axis !== 'both' ? axis : (Math.abs(x) >= Math.abs(y) ? 'horizontal' : 'vertical')
           const dir = resolvedAxis === 'horizontal' ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up')
           return { axis, dir }
       }
   }
   ```

---

## File Analysis: `zunstand/carouselState.ts`

**New version:** `interaction/zunstand/carouselState.ts`

> Covered in the carousel audit. Key issues summarized here for completeness.

### Potential Bugs / Vulnerabilities

1. **`swipe()` truthiness bug** — `if (offset)` drops `delta1D === 0`
2. **`setPosition()` missing `pendingDir` guard** — wasted settle cycles
3. **`Direction` type changed** — old callers passing string would silently fail
4. **`Object.freeze()` in `get()` redundant** with immer

### Potential Performance / Lag Issues

1. **`setSize()` lost equality guard** — unnecessary re-renders from ResizeObserver
2. **`setCount()` lost `Math.max(0, count)` guard**

### Suggested Fixes

See carousel audit for detailed fixes.

---

## File Analysis: `zunstand/dragState.ts`

**New version:** `interaction/zunstand/dragState.ts`

### Potential Bugs / Vulnerabilities

1. **CRITICAL: `setConstraints` has copy-paste bug — `minY`/`maxY` are never set**
   ```ts
   setConstraints: (id, packet) => {
       set(state => {
           const s = state.dragStore[id]
           if (packet.minX !== undefined) s.minX = packet.minX;
           if (packet.maxX !== undefined) s.maxX = packet.maxX;
           if (packet.minX !== undefined) s.minX = packet.minX;  // ← duplicate of minX
           if (packet.maxX !== undefined) s.maxX = packet.maxX;  // ← duplicate of maxX
       })
   },
   ```

   Lines 3-4 are copy-pasted from lines 1-2 instead of checking `minY`/`maxY`. The Y-axis constraints are **never updated** from the component's configuration.

   Old version:
   ```ts
   s.minX = packet.minX
   s.maxX = packet.maxX
   s.minY = packet.minY
   s.maxY = packet.maxY
   ```

   **Impact:** Any drag element with Y-axis constraints (`minY`, `maxY`) will behave as if `minY = -Infinity` and `maxY = Infinity` (the defaults). Vertical drag boundaries are completely ignored.

2. **`swipeStart` sets `dragging = false` — should be `true`**
   ```ts
   swipeStart: (desc) => {
       set(state => {
           const s = state.dragStore[desc.base.id]
           s.dragging = false   // ← should be true
           s.offset = { x: 0, y: 0 }
       })
   },
   ```

   Old version:
   ```ts
   swipeStart(desc: Descriptor) {
       store.mutate('drag', desc.base.id, (s) => {
           s.dragging = true    // ← correct
           s.offset = { x: 0, y: 0 }
       })
   }
   ```

   **Impact:** If any component subscribes to `dragging` to adjust UI during a drag (e.g., visual feedback, disabling transitions), it will never see `dragging = true` at swipe start.

3. **`Object.freeze()` in `get()` — same redundancy as carousel store**

### Potential Performance / Lag Issues

No significant issues beyond the unnecessary `Object.freeze()`.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Constraints | All 4 set unconditionally | Only X-axis set (Y-axis copy-paste bug) |
| `swipeStart` dragging | `true` | `false` (bug) |

### Suggested Fixes / Explanations

1. **Fix `setConstraints` copy-paste bug:**
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

2. **Fix `swipeStart` dragging:**
   ```ts
   swipeStart: (desc) => {
       set(state => {
           const s = state.dragStore[desc.base.id]
           s.dragging = true
           s.offset = { x: 0, y: 0 }
       })
   },
   ```

---

## File Analysis: `zunstand/sliderState.ts`

**New version:** `interaction/zunstand/sliderState.ts`

### Potential Bugs / Vulnerabilities

1. **No significant bugs.** The slider store is cleanly structured.

2. **`Object.freeze()` in `get()` — same minor redundancy.**

### Potential Performance / Lag Issues

No issues.

### Relevant Differences from Old Version

- Clean migration from generic store to dedicated Zustand store
- No logic lost or changed

### Suggested Fixes / Explanations

No fixes needed.

---

## File Analysis: `zunstand/sizeState.ts`

**New version:** `interaction/zunstand/sizeState.ts`

### Potential Bugs / Vulnerabilities

1. **`init()` is effectively a no-op — never does anything**
   ```ts
   init: () => {
       const s = get()
       if (s.device) return  // ← always truthy because device is set in initial state
       // ... rest never executes
   }
   ```

   The store initializes `device` in the immer factory, so `s.device` is always defined, and `init()` always returns early. This means `init()` is dead code. The store works correctly because it initializes in the factory itself.

   **Impact:** None — the store works fine. But `init()` is vestigial.

2. **No `window.resize` listener wired up**

   The store has an `update()` method that recalculates scale on viewport resize, but there's no visible `window.addEventListener('resize', update)` call. If nothing calls `update()` on resize, the scale values become stale after browser resize or orientation change.

   In the old version, the same issue would exist — `updateSize()` was defined but the caller would need to wire it up.

### Potential Performance / Lag Issues

No issues.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Architecture | Generic store via `store.ensure('sizeState', 'device', ...)` | Dedicated Zustand store with immer |
| State access | `ensure()` guarantees existence | Factory initializer + dead `init()` |
| React hook | None (accessed directly) | `useSize()` with `useShallow` |

### Suggested Fixes / Explanations

1. **Remove dead `init()` method** or fix the guard:
   ```ts
   init: () => {
       // Already initialized in factory — remove this method
   }
   ```

---

## File Analysis: `zunstand/stateManager.ts`

**New version:** `interaction/zunstand/stateManager.ts`

### Analysis

This file is **entirely commented out**. It contains abandoned attempts at creating a generic dispatch layer on top of the individual stores. The pipeline now dispatches directly to stores.

**No active code.** No issues or bugs. Can be deleted for cleanliness.

---

## File Analysis: `updater/renderer.ts`

**New version:** `interaction/updater/renderer.ts`

### Potential Bugs / Vulnerabilities

1. **Renderer reads `base.event` — does not detect solver event overrides**

   ```ts
   if (desc.base.event) {
       typeHandlers[desc.base.event]?.(desc.base.element)
   }
   ```

   This is part of the critical pipeline/solver event routing bug. When the solver decides to revert, the renderer still renders `'swipeCommit'` DOM attributes instead of `'swipeRevert'`. Both happen to remove `data-swiping`, so the visual effect is the same — but semantic events fired to listeners carry the wrong event type.

2. **`setAttr` lost null guard on `element`**

   Old: `function setAttr(element: HTMLElement | null | undefined, ...) { if (!element) return; ... }`  
   New: `function setAttr(element: HTMLElement, ...) { ... }`

   The top-level `render.handle` checks `if (!desc.base.element) return`, so the main path is safe. `handleExtras` accesses `cancel.element` which is validated by `if (!cancel?.pressCancel) return`. Low risk.

3. **`handleExtras` now checks `desc.base.event !== 'swipeStart'` as gate**

   This is correct — extra press-cancel handling only applies during swipe start.

### Potential Performance / Lag Issues

No issues.

### Relevant Differences from Old Version

| Aspect | Old | New |
|---|---|---|
| Event source | `descriptor.runtime.event` | `desc.base.event` |
| Cancel source | `descriptor.runtime.cancel` | `desc.cancel` (top-level) |
| Null guards | In `setAttr` and `dispatchEvent` | In `render.handle` only |
| Type filter | Uses generic descriptor | TypeScript narrows via `Exclude<Descriptor, ButtonDescriptor>` |

### Suggested Fixes / Explanations

1. **Once pipeline event routing is fixed, also update renderer to use the resolved event:**
   ```ts
   const event = desc.solutions?.eventChange ?? desc.base.event
   if (event) typeHandlers[event]?.(desc.base.element)
   ```

---

## File Analysis: `types/` (Overview)

**New version:** `interaction/types/primitives.ts`, `descriptor.ts`, `base.ts`, `data.ts`, `solutions.ts`, `gestureTypeGuards.ts`

### Potential Bugs / Vulnerabilities

1. **`Direction` type change from string union to discriminated object is a major breaking change**

   Old (global ambient): `type Direction = 'left' | 'right' | 'up' | 'down'`  
   New (explicit export): `type Direction = { axis: 'horizontal'; dir: 'left' | 'right' } | { axis: 'vertical'; dir: 'up' | 'down' } | { axis: 'both'; dir: ... }`

   All consumers must use `direction.dir` instead of `direction` for comparisons, and all producers must construct the object form. The codebase has been updated (solverUtils, vectorUtils, carouselState), but any external consumer or future code using the old pattern would silently fail.

2. **`CarouselSolutions.eventChange` is unused by both solver and pipeline**

   ```ts
   export type CarouselSolutions = {
       stateAccepted: boolean
       delta1D?: number
       eventChange?: string  // ← never read, solver writes 'event' instead
       direction?: Direction
   }
   ```

   The field was likely intended to replace the old `RuntimePatch.event` but was never connected. The solver still writes `event` (wrong property), and the pipeline reads `base.event` (different object).

3. **`gestureTypeGuards.ts` assertion functions don't throw in production**

   ```ts
   export function descIs<T extends Descriptor['type']>(
       value: Descriptor, type: T
   ): asserts value is Extract<Descriptor, { type: T }> {
       if (value.type !== type) {
           const msg = `Expected ${type}, got ${value.type}`
           if (import.meta.env.VITE_DEBUG === 'true') throw new Error(msg)
           console.warn(msg)  // ← production: warns but doesn't throw
       }
   }
   ```

   In production, a type mismatch only produces a `console.warn`, but TypeScript's control flow still narrows the type as if the assertion succeeded. This means downstream code operates on a wrongly-typed value. This could cause subtle runtime errors in production that would be caught in debug mode.

### Suggested Fixes / Explanations

1. **Rename `eventChange` to `event` in `CarouselSolutions`** — or vice versa, fix the solver to use `eventChange` — and wire it into the pipeline.
2. **Consider always throwing in type guard assertions** — or return a boolean instead of using `asserts`.

---

## Summary of Main Issues Across Files

### Critical Bugs

| # | Issue | File(s) | Severity |
|---|---|---|---|
| 1 | **Pipeline ignores solver event override → carousel `swipeRevert` is dead code** — panels stuck at partial drag position after rejected swipe | `pipeline.ts`, `carouselSolver.ts`, `renderer.ts` | **Critical** |
| 2 | **`dragState.setConstraints` copy-paste bug** — Y-axis constraints (`minY`/`maxY`) never set | `dragState.ts` | **High** |
| 3 | **`dragState.swipeStart` sets `dragging = false`** instead of `true` | `dragState.ts` | **Medium** |
| 4 | **`targetResolver.build*Data` crash on uninitialized store** — no `ensure`/`init` before read | `targetResolver.ts` | **Medium** |
| 5 | **`interpreter.applyGestureUpdate` crashes on missing gesture** — no null guard | `interpreter.ts` | **Medium** |

### Performance / Lag Issues

| # | Issue | File(s) | Impact |
|---|---|---|---|
| 6 | **Pipeline always dispatches to store** (no `stateAccepted` guard) — wasted immer `set()` on every gated/blocked pointer-move | `pipeline.ts` | Low–Moderate |
| 7 | **`carouselState.setSize` lost equality guard** — unnecessary renders from ResizeObserver | `carouselState.ts` | Moderate |
| 8 | **`carouselState.setPosition` lost `pendingDir` guard** — wasted settle cycles on every transitionEnd | `carouselState.ts` | Low–Moderate |

### Correctness / Type Issues

| # | Issue | File(s) | Impact |
|---|---|---|---|
| 9 | **`resolveGate` hysteresis lower bound likely inverted** — 5px strip at track start is incorrectly gated | `solverUtils.ts` | Low |
| 10 | **`vectorUtils.resolveDirection` unhandled case** — Vec2 + non-'both' axis returns undefined | `vectorUtils.ts` | Low |
| 11 | **`CarouselSolutions.eventChange` dead field** — solver writes `event`, pipeline reads `base.event` | `solutions.ts`, `carouselSolver.ts`, `pipeline.ts` | Part of bug #1 |
| 12 | **`sizeState.init()` is a no-op** — dead code | `sizeState.ts` | None |

### Recommended Fix Priority

1. **Fix pipeline event routing + carousel solver `eventChange`** → fixes dead `swipeRevert`, unblocks all carousel revert behavior
2. **Fix `dragState.setConstraints`** → fixes broken Y-axis drag boundaries
3. **Fix `dragState.swipeStart` `dragging` flag** → quick one-liner
4. **Add null guards** to `interpreter.applyGestureUpdate` and `targetResolver.build*Data` → prevents crashes
5. **Re-add `stateAccepted` guard in pipeline** → reduces wasted work during blocked gestures
6. **Re-add `carouselState.setSize` equality guard** → reduces render churn
7. **Re-add `carouselState.setPosition` pendingDir guard** → reduces wasted settle cycles
8. **Fix `solverUtils.resolveGate` hysteresis** → corrects edge boundary
9. **Fix `vectorUtils.resolveDirection` missing case** → defensive completeness
