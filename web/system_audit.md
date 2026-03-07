# System Audit

## Critical Bugs

### Rapid carousel gestures can corrupt index state

**Location:**
[carouselState.js](src/interaction/state/carouselState.js) — `swipeCommit` / `setPosition`

**Problem:**
Carousel commit is a two-phase process: `swipeCommit` sets `pendingDir` and `offset` (triggering a CSS transition), then `transitionend` calls `setPosition` to finalize `index`. If a user starts a new swipe before `transitionend` fires, the new `swipeStart` sets `dragging = true` and `pendingDir = null`, but `index` was never updated from the previous commit. The carousel's scene index is now out of sync with what was visually displayed.

**Why it is risky:**
Users can swipe quickly in succession. The carousel will show the wrong scene, and subsequent swipes will navigate relative to the stale `index`. Recovery requires a full page reload.

**Suggested Fix:**
Call `setPosition` synchronously at the start of `swipeStart` if `pendingDir` is non-null (i.e., a previous commit hasn't finalized). This ensures index is always current before a new gesture begins.

**Risk Level:** HIGH  
**Effort:** LOW

---

### `pointercancel` treated as commit instead of revert

**Location:**
[bridge.js](src/interaction/bridge/bridge.js) — `handlePointerUp` handles both `pointerup` and `pointercancel`

**Problem:**
When the browser cancels a pointer (e.g., system gesture takes over, tab switch, scrollbar interaction), the bridge calls `handlePointerUp`, which triggers `pipeline.orchestrate({eventType: 'up', ...})`. This produces a `swipeCommit`, which for slider/drag commits the position at the last known pointer location. For carousel, the solver may revert if below threshold, but the gesture was externally interrupted — not intentionally released.

**Why it is risky:**
On Android WebView, system gestures (edge swipe, notification pull) commonly trigger `pointercancel`. Committing a slider or drag position at an interrupted point is unexpected behavior.

**Suggested Fix:**
Distinguish `pointercancel` from `pointerup` in the bridge. Forward a different `eventType` (e.g., `'cancel'`) that the interpreter handles as a forced revert/reset without emitting `swipeCommit`.

**Risk Level:** MEDIUM  
**Effort:** MEDIUM

---

## Architectural Boundary Violations

### Interpreter layer performs DOM queries

**Location:**
[interpreter.js](src/interaction/core/interpreter.js) → [intentUtils.js](src/interaction/core/intentUtils.js) → [targetResolver.js](src/interaction/core/targetResolver.js)

**Problem:**
The interpreter calls `utils.resolveTarget(x, y)` (which calls `document.elementsFromPoint`) on pointer down, and `utils.resolveSwipeTarget(x, y, ...)` (which also queries DOM and calls `getBoundingClientRect`) on swipe start. This makes the "intent interpretation" layer dependent on DOM state, violating the principle that only the renderer should perform DOM side effects.

**Why it is risky:**
DOM queries during gesture processing create implicit coupling between the gesture pipeline and the rendering/layout state. If elements are in the middle of a CSS transition or layout reflow, stale or incorrect elements may be returned. This also prevents the gesture system from being testable without a DOM.

**Suggested Fix:**
Accept this as a necessary architectural compromise for target resolution. The target resolver is conceptually a "sensor" rather than a "side-effect producer." Document this exception explicitly in the contract. To improve testability, consider making `targetResolver` injectable so it can be mocked in tests.

**Risk Level:** LOW (functional risk is minimal)  
**Effort:** MEDIUM (to make injectable)

---

### `gestureUpdate` creates bidirectional coupling between solvers and interpreter

**Location:**
[pipeline.js](src/interaction/core/pipeline.js) — `interpreter.applyGestureUpdate(solution.gestureUpdate)`  
[sliderSolver.js](src/interaction/solvers/sliderSolver.js) — `swipeStart` returns `gestureUpdate`

**Problem:**
The slider solver's `swipeStart` returns `gestureUpdate: { sliderStartOffset, sliderValuePerPixel }`, which the pipeline merges back into the interpreter's stored descriptor via `interpreter.applyGestureUpdate()`. This creates a data flow cycle: interpreter → solver → interpreter. The interpreter is no longer a pure FSM; its state is influenced by solver output.

**Why it is risky:**
Bidirectional data flow makes the system harder to reason about. The interpreter's `desc` now contains solver-computed values (`sliderStartOffset`, `sliderValuePerPixel`) that are not part of the original target resolution. If another solver or a future change also writes to `gestureUpdate`, ordering and overwrite bugs become likely.

**Suggested Fix:**
Move `sliderStartOffset` and `sliderValuePerPixel` computation into the interpreter or target resolver (at swipe start time), so the data flows in one direction. Alternatively, have the pipeline maintain a separate `solverContext` object that accumulates solver state across events, rather than writing back into the interpreter's descriptor.

**Risk Level:** MEDIUM  
**Effort:** MEDIUM

---

## Gesture Lifecycle Issues

### Slider does not respond to taps

**Location:**
[SwipeLane.vue](src/lanes/SwipeLane.vue) — slider template does not set `data-press`  
[targetResolver.js](src/interaction/core/targetResolver.js) — `buildReactions` checks `ds.press`

**Problem:**
Slider elements are not marked as `pressable` (no `data-press` attribute). When a user taps a slider without crossing the swipe threshold, the gesture goes PENDING → `pressRelease`. No solver handles `pressRelease`, and `stateAccepted` is not set, so the slider value doesn't change. Users cannot tap-to-position on sliders.

**Why it is risky:**
Tap-to-position is a standard slider UX pattern. Users who tap the slider track expect the thumb to jump to that position.

**Suggested Fix:**
Either (a) add a `pressRelease` handler to the slider solver that computes the value from the pointer position, or (b) lower the swipe threshold for sliders so any touch immediately triggers `swipeStart`, or (c) mark sliders as pressable and handle the `press` event to compute and commit the initial value.

**Risk Level:** LOW (UX issue, not a bug)  
**Effort:** LOW

---

### No explicit gesture cancellation path

**Location:**
[interpreter.js](src/interaction/core/interpreter.js) — `onUp` only handles SWIPING and PENDING

**Problem:**
If a pointer disappears without `pointerup` or `pointercancel` (rare but possible with multi-touch edge cases or browser bugs), the interpreter's state remains in PENDING or SWIPING. Subsequent pointer downs still set `phase = 'PENDING'` (overwriting), but the `totalDelta`, `start`, and `last` values may contain stale data from the previous gesture.

The bridge guards against this with `if (isActive) return` in `handlePointerDown`, but this guard is per-element. A different element could start a new gesture while the global interpreter is in a stale state.

**Why it is risky:**
Unlikely but possible race condition. The single-pointer guard in the bridge mitigates most scenarios, but the interpreter's global singleton state is not protected against multi-element pointer sequences.

**Suggested Fix:**
Add a safety reset at the top of `onDown`: if `gesture.phase !== 'IDLE'`, call `resetGesture()` before proceeding. This makes the interpreter self-healing.

**Risk Level:** LOW  
**Effort:** LOW

---

## State Ownership Problems

### Slider `ensure()` omits `dragging` and `thumbSize` initial properties

**Location:**
[sliderState.js](src/interaction/state/sliderState.js) — `ensure()`

**Problem:**
The `ensure()` function creates a slider with `{ value, offset, min, max, size }`. The `dragging` and `thumbSize` properties are added dynamically later by `swipeStart` and `setThumbSize`. While Vue 3's Proxy-based reactivity tracks dynamically added properties, this creates a window where `slider.dragging` is `undefined` (falsy, which happens to work) and `slider.thumbSize` is `undefined` (returns `0` via the `?? 0` fallback in `getThumbSize`).

**Why it is risky:**
Relies on undefined-is-falsy behavior rather than explicit initial values. If any consumer checks `slider.dragging === false` (strict equality), it will fail before the first swipe.

**Suggested Fix:**
Add `dragging: false` and `thumbSize: { x: 0, y: 0 }` to the initial state in `ensure()`.

**Risk Level:** LOW  
**Effort:** LOW

---

### Drag constraint fields stored flat on lane object

**Location:**
[dragState.js](src/interaction/state/dragState.js) — `setConstraints` writes `drag.minX`, `drag.maxX`, etc. directly on the lane

**Problem:**
Unlike carousel and slider which store type-specific data within the lane object's initial field set, drag constraints are stored as flat properties (`minX`, `maxX`, `minY`, `maxY`) on the lane object. The initial `ensure()` does not include these properties, and they share the same namespace as the other lane fields (`position`, `offset`, `size`, `dragging`).

**Why it is risky:**
Inconsistent with how other state files organize their data. Makes it unclear what fields a drag lane actually has. If a field name like `size` were to conflict (it doesn't currently), debugging would be difficult.

**Suggested Fix:**
Store constraints as a nested object: `constraints: { minX, maxX, minY, maxY }` initialized in `ensure()`. Update `getConstraints` and `setConstraints` accordingly.

**Risk Level:** LOW  
**Effort:** LOW

---

### `targetResolver` reads mutable state during gesture pipeline

**Location:**
[targetResolver.js](src/interaction/core/targetResolver.js) — `buildSwipe` calls `state.getCurrentIndex`, `state.getSize`, `state.getConstraints`, `state.getPosition`

**Problem:**
Target resolution reads state (e.g., carousel index, drag position) at the moment of pointer down and swipe start. If state was mutated between pointer down and swipe start (e.g., an async animation completes), the descriptor carries stale values. Since target resolution happens inside the synchronous pipeline, this is rarely a problem in practice — but the `state.getCurrentIndex` for carousel reads `index` which may be stale if `pendingDir` is set (animation in progress but not finalized).

**Why it is risky:**
Related to the rapid carousel gesture bug above. The descriptor captures `carousel.index` at pointer down, but if a previous animation hasn't finalized, this index is wrong.

**Suggested Fix:**
Resolve the rapid gesture bug (finalize pending commits on new swipeStart). This eliminates the stale-index window.

**Risk Level:** MEDIUM (already covered by rapid gesture fix)  
**Effort:** LOW (fixed as side effect of other fix)

---

## Naming / Clarity Problems

### `event` vs `type` naming inverted from common convention

**Location:**
All descriptor-producing code

**Problem:**
The codebase uses `event` for the gesture event name (press, swipe, swipeCommit, etc.) and `type` for the lane type (carousel, slider, drag). This is internally consistent but inverted from the old contract (which used `type` for event and `swipeType` for lane type). More importantly, `type` is extremely generic — in a Vue codebase `type` is commonly a prop type, a component type, or a TypeScript type. Using `type` for "carousel | slider | drag" obscures its meaning.

**Suggested rename:** `type` → `laneType` (or `gestureType`) across the codebase. This is a sweeping change that should be done carefully with find-and-replace.

**Risk Level:** LOW (clarity, not correctness)  
**Effort:** HIGH (touches every file)

---

### `cancel` field name ambiguous

**Location:**
[interpreter.js](src/interaction/core/interpreter.js) — swipeStart returns `cancel: pressCancelEvent`  
[pipeline.js](src/interaction/core/pipeline.js) — `if (solution.cancel) render.handle(solution.cancel)`

**Problem:**
The `cancel` field on a swipeStart descriptor holds a `pressCancel` event for the ORIGINAL target (when the swipe target changed via fallback). The name `cancel` suggests the swipe itself is being cancelled, not that a prior press is being cancelled. The old contract used `extra` which was also unclear.

**Suggested rename:** `cancel` → `pressCancel` or `priorPressCancel` to make the relationship clear.

**Risk Level:** LOW  
**Effort:** LOW

---

### Stale comments referencing old architecture

**Location:**
[carouselSolver.js](src/interaction/solvers/carouselSolver.js) — "Receives descriptor from reactionManager"  
[sliderSolver.js](src/interaction/solvers/sliderSolver.js) — "Receives descriptor from reactionManager"  
[dragSolver.js](src/interaction/solvers/dragSolver.js) — "Receives descriptor from reactionManager", "Uses dragPolicy"

**Problem:**
Module-level doc comments reference `reactionManager` and type-specific `Policy` files that no longer exist. These were from a previous architecture iteration. The current architecture uses `pipeline.js` as the orchestrator.

**Suggested Fix:**
Update comments to reference `pipeline.js` as the caller. Remove references to policy files.

**Risk Level:** LOW  
**Effort:** LOW

---

### `interpreter.js` named `IntentMapper` in comments but exported as `interpreter`

**Location:**
[interpreter.js](src/interaction/core/interpreter.js) — comment says "IntentMapper", export says `interpreter`

**Problem:**
The module comment calls itself "IntentMapper" but the exported object is `interpreter`. The file is named `interpreter.js`. The old contract used "interpreter" terminology. The internal comment creates confusion about the canonical name.

**Suggested Fix:**
Update the comment to match the export name: "Interpreter" or "Gesture Interpreter."

**Risk Level:** LOW  
**Effort:** LOW

---

## Structural Complexity

### `SwipeLane.vue` handles four unrelated component types

**Location:**
[SwipeLane.vue](src/lanes/SwipeLane.vue)

**Problem:**
`SwipeLane` is a ~350-line component that handles carousel, slider, drag, AND button via `v-if`/`v-else-if` branches on `props.type`. Each branch has its own template, setup logic, composable usage, and emit patterns. The branches share almost no code — each is an independent mini-component that happens to be in the same file.

**Why it is risky:**
- Hard to read and maintain — each type's logic is interleaved.
- Changes to one type risk breaking another (shared `defineProps` contains props for all types).
- The component's responsibility is unclear: is it a carousel? A slider? A button?
- Props like `snapX`, `snapY`, `locked` are drag-only but defined on the shared component.

**Suggested Fix:**
Extract into separate components: `CarouselLane.vue`, `SliderLane.vue`, `DragLane.vue`, `ButtonLane.vue` (or keep `SwipeLane` as a thin router that renders sub-components). Alternatively, accept the current structure if the "one component, one API" philosophy is intentional for consumers.

**Risk Level:** LOW (maintainability, not correctness)  
**Effort:** MEDIUM

---

### `solverUtils.js` mixes concerns for all three solver types

**Location:**
[solverUtils.js](src/interaction/solvers/solverUtils.js)

**Problem:**
`solverUtils` contains shared logic (`normalize1D`, `resolveGate`) alongside carousel-specific, slider-specific, and drag-specific functions. It is the largest solver file and has no internal separation of concerns.

**Why it is risky:**
As more logic is added per solver type, this file will grow. Functions like `resolveSliderStart` and `resolveSnapAdjustment` have no relationship to each other but share a namespace.

**Suggested Fix:**
Split into `sharedUtils.js` (normalize, gate), and move type-specific functions into their respective solver files or into dedicated helper files. Alternatively, keep as-is but add clear section comments (which partially exist).

**Risk Level:** LOW  
**Effort:** LOW

---

### `sizeState.js` mixes device info with normalization functions

**Location:**
[sizeState.js](src/interaction/state/sizeState.js)

**Problem:**
This file is responsible for (a) device detection and validation, (b) viewport scale computation, (c) scaled axis size computation, and (d) the `normalizeParameter` function used throughout the pipeline. These are related but conceptually distinct concerns. The `normalizeParameter` function is especially important — it's the bridge between viewport coordinates and logical device coordinates — but it's buried in a file whose name suggests it only manages size state.

**Why it is risky:**
Developers looking for "where does normalization happen" won't find it quickly. The function is imported by `intentUtils.js` and drives all delta normalization in the pipeline.

**Suggested Fix:**
Consider renaming the file to `deviceState.js` or splitting normalization into a dedicated utility.

**Risk Level:** LOW  
**Effort:** LOW

---

## Recommended Refactors

### Add safety reset in interpreter `onDown`

**Location:** [interpreter.js](src/interaction/core/interpreter.js) — `onDown`

**Description:** If `gesture.phase !== 'IDLE'` when `onDown` is called, call `resetGesture()` first. This makes the interpreter self-healing against orphaned gesture state from missed `pointerup`/`pointercancel` events.

**Risk Level:** LOW  
**Effort:** LOW

---

### Finalize pending carousel commit on new gesture start

**Location:** [carouselState.js](src/interaction/state/carouselState.js) — `swipeStart`

**Description:** At the start of `swipeStart`, check if `pendingDir` is non-null. If so, call `setPosition(id)` to finalize the previous animation before starting the new gesture. This prevents index corruption from rapid swipes.

**Risk Level:** HIGH (fixes critical bug)  
**Effort:** LOW

---

### Distinguish `pointercancel` from `pointerup` in bridge

**Location:** [bridge.js](src/interaction/bridge/bridge.js)

**Description:** Add a separate handler for `pointercancel` that calls `pipeline.orchestrate({eventType: 'cancel', ...})`. Add an `onCancel` path in the interpreter that resets without emitting `swipeCommit`.

**Risk Level:** MEDIUM  
**Effort:** MEDIUM

---

### Initialize all properties in state `ensure()` functions

**Location:** [sliderState.js](src/interaction/state/sliderState.js), [dragState.js](src/interaction/state/dragState.js)

**Description:** Add `dragging: false`, `thumbSize: { x: 0, y: 0 }` to slider ensure. Add `minX: 0, maxX: 0, minY: 0, maxY: 0` to drag ensure. This eliminates reliance on dynamic property addition.

**Risk Level:** LOW  
**Effort:** LOW

---

# Priority Fix List

| Priority | Issue | Risk | Effort |
|----------|-------|------|--------|
| 1 | Finalize pending carousel commit on new gesture start | HIGH | LOW |
| 2 | Add safety reset in interpreter `onDown` | LOW | LOW |
| 3 | Initialize all properties in state `ensure()` functions | LOW | LOW |
| 4 | Update stale comments (reactionManager, policy references) | LOW | LOW |
| 5 | Rename `cancel` → `pressCancel` on swipeStart descriptor | LOW | LOW |
| 6 | Distinguish `pointercancel` from `pointerup` in bridge | MEDIUM | MEDIUM |
| 7 | Resolve `gestureUpdate` bidirectional coupling | MEDIUM | MEDIUM |
| 8 | Split `SwipeLane.vue` into per-type components | LOW | MEDIUM |
| 9 | Rename `type` → `laneType` across codebase | LOW | HIGH |
