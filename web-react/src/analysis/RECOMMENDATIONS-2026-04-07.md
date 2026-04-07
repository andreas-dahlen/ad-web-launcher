# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

//DONE Remove `useCarouselScenes` and related code
### Fix `DragCtxPartial` to include `delta` and `direction`
**Category:** Type Safety / Consistency
**Impact:** High
**Effort:** Low
**Details:** `DragCtxPartial` in `ctxType.ts` is `Partial<Pick<CtxDrag, 'storeAccepted'>>`. It needs to also pick `delta` (from `CtxDrag`) to match the actual return shape of `dragSolver.swipe` and `dragSolver.swipeCommit`. Additionally, `CtxDrag` itself is missing an optional `direction` field — `dragSolver.swipeCommit` computes and returns one via `dragUtils.resolveDirection`, but it has nowhere to land in the type. Either add `direction?: Direction` to `CtxDrag` and include it in `DragCtxPartial`, or remove the `direction` computation from `dragSolver.swipeCommit` / `dragUtils.resolveDirection` if it is genuinely unused downstream.

//DONE
### Remove all dead commented-out code
**Category:** Dead Code
**Impact:** High
**Effort:** Low
**Details:** Delete the following in a single pass:
- `useCarouselScenes.ts` — entire file is commented out.
- `carouselStore.ts` — commented-out `scenes: number[]` field and `setScenes` method.
- `ctxType.ts` — commented-out `// eventChange?: string` on `CtxCarousel`.
- `primitiveType.ts` — commented-out `Mutable<T>` utility type.
- `pipeline.ts` — two commented-out `applyGestureUpdate` lines in the carousel and drag branches.
- `ctxType.ts` — commented-out `// direction?: Direction` on `CtxDrag` (resolve with the `DragCtxPartial` ticket above — either uncomment it or delete it).


//DONE
### Remove unused `resolveCancel` from `intentUtils.ts`
**Category:** Dead Code
**Impact:** Medium
**Effort:** Low
**Details:** `resolveCancel` in `intentUtils.ts` has no call site. The interpreter handles cancellation directly by setting `desc.ctx.cancel` in `interpreter.ts`. Confirm with a project-wide search and delete if unused.

//DONE (file deleted)
### Remove unused `isGestureType` from `gestureTypeGuards.ts`
**Category:** Dead Code
**Impact:** Low
**Effort:** Low
**Details:** `isGestureType` asserts that a value is one of the four `InteractionType` values, but if the input is already typed as `InteractionType` the assertion is a no-op. No usage was found. Remove it.

//DONE
### Remove duplicate `data-type="drag"` from outer container in `Drag.tsx`
**Category:** Consistency / Dead Code
**Impact:** Low
**Effort:** Low
**Details:** The outer container div in `Drag.tsx` carries `data-type='drag'` but has no `data-id`. It's never matched by the interaction system. Remove the attribute from the outer div to avoid debugging confusion.

---

## High Priority
*High impact, higher effort or risk — plan these carefully*

//DONE (null checks added, returning `null` from builders should propagating through `resolveFromElement`)
### Replace non-null assertions in `buildDesc` with safe lookups
**Category:** Error Handling / Type Safety
**Impact:** High
**Effort:** Medium
**Details:** `buildDesc.buildCarouselData`, `buildSliderData`, and `buildDragData` in `buildDesc.ts` use the `!` operator on store reads: `carouselStore.getState().get(ctx.id)!`. If the store entry is missing (race between unmount and in-flight gesture), this crashes. Replace with a null check and early return (returning `null` from the builder, propagated through `resolveFromElement`).

//DONE
### Wrap `setPointerCapture` in try/catch in bridge
**Category:** Error Handling
**Impact:** High
**Effort:** Low
**Details:** `setPointerCapture` in `bridge.ts` (inside `handlePointerDown`) is not wrapped in a try/catch. If the element is removed from the DOM between event creation and handler execution, this throws. Add a try/catch around `el?.setPointerCapture(e.pointerId)` matching the pattern already used for `releasePointerCapture` in the disabled-cleanup effect.

//DONE File should be deleted
### Fix assertion functions to enforce in production or drop `asserts`
**Category:** Type Safety / Error Handling
**Impact:** High
**Effort:** Medium
**Details:** The `asserts` functions in `gestureTypeGuards.ts` (`descIs`, `isCarousel`, `isDrag`, `isSlider`, `isButton`) only throw when `VITE_DEBUG === 'true'`. In production they `console.warn` and continue — but the `asserts` return type tells TypeScript the type is narrowed. Either make them always throw (the honest approach), or change them to return-type type guards (`value is Extract<...>`) that return a boolean so callers can handle the failure path.


//DONE
//NOTE how likely is a pointer sequence to be interrupted without a cancel/up event? pointercancel is already mapped to handlePointerUp in the bridge, so that covers most cases. However i added a minimal max-entries cap.
### Add stale gesture cleanup to interpreter
**Category:** Error Handling
**Impact:** Medium
**Effort:** Medium
**Details:** The `gestures` map in `interpreter.ts` relies entirely on `onUp` / `deleteGesture` for cleanup. If a pointer sequence is interrupted without a cancel/up event, entries persist indefinitely. Add either a max-age TTL check (e.g., prune entries older than N seconds on each `onDown`) or a max-entries cap.

//DONE
### Type the `CustomEvent.detail` in bridge callbacks
**Category:** Type Safety
**Impact:** Medium
**Effort:** Medium
**Details:** In the `onReaction` callbacks within `Button.tsx`, `Carousel.tsx`, `Slider.tsx`, and `Drag.tsx`, `reaction.detail` is `any`. Define a typed `ReactionEvent = CustomEvent<CtxType>` and use it in the `usePointerForwarding` hook's `onReaction` prop signature and the `handleReaction` listener. This removes `any` from the component callback internals.


//DONE
//NOTE eliminated the DOM dependency from intentUtils entirely by moving the orchestration logic into the interpreter and cleaning up domQuery
### Split `intentUtils.ts` by responsibility
**Category:** Separation of Concerns
**Impact:** Medium
**Effort:** Medium
**Details:** `intentUtils.ts` contains pure utilities (`normalizedDelta`), domain logic (`resolveAxis`, `swipeThresholdCalc`, `resolveSupports`), DOM-touching logic (`resolveSwipeStart` which calls `domQuery.findLaneInDom`), and descriptor mutation (`resolveCancel`, if retained). Consider splitting into: pure math/normalization helpers, swipe-start resolution (which depends on DOM), and reaction/support checks.

> **Prior developer note (2026-04-05, SKIPPED):** "intentUtils is already quite focused on gesture interpretation and the individual functions are small. The proposed split would create many tiny files with only one or two functions each, increasing indirection without a clear organizational benefit. If the file grows significantly in the future, we can revisit." — Carried forward because the analysis still flags mixed responsibilities (pure math + DOM queries in one file). Respect the prior decision if the file hasn't grown.

---

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

### Rename `bridge.ts` to match its export
**Category:** Naming
**Impact:** Medium
**Effort:** Low
**Details:** The file is `bridge.ts` but the export is `usePointerForwarding`. Rename the file to `usePointerForwarding.ts` (matching the React hook naming convention), or rename the hook to `useBridge` so the file and export align. The rest of the codebase imports from `@components/hooks/bridge.ts` so update the import paths accordingly.

### Rename inner store keys to avoid shadowing
**Category:** Naming
**Impact:** Medium
**Effort:** Low
**Details:** `carouselStore` is both the Zustand store export and the state key, producing `carouselStore.getState().carouselStore[id]`. Same for `sliderStore` and `dragStore`. Rename the inner keys to `items`, `entries`, or `instances` — e.g., `carouselStore.getState().items[id]` — to eliminate the double-name confusion.

### Rename `resolveGate` to describe its function
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `resolveGate` in `utilsShared.ts` performs a cross-axis hysteresis check. Rename to something descriptive like `isCrossAxisOutOfBounds` or `exceedsCrossAxisThreshold` so the function's purpose is clear without reading its body.

### Type `VALID_AXES` and `VALID_TYPES` as narrow Sets
**Category:** Type Safety
**Impact:** Low
**Effort:** Low
**Details:** In `primitiveType.ts`, `VALID_AXES` is `Set<string>` and `VALID_TYPES` is `Set<string>`. Changing them to `Set<Axis>` and `Set<InteractionType>` respectively would allow TypeScript to narrow through `.has()` checks in `buildContext.ts`, potentially removing the `as` casts.

### Rename `useCarouselZustand` / `useSliderZustand` / `useDragZustand`
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** These hook names expose the implementation library. Consider `useCarouselStore`, `useSliderStore`, `useDragStore` — or even `useCarousel`, `useSlider`, `useDrag` — to name the abstraction rather than the library.

### Rename `normalizeParameter` in `sizeStore.ts`
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `normalizeParameter` doesn't indicate that it converts CSS pixels to device-independent pixels via the scale factor. A name like `cssToDevicePixels` or `scaleToDevice` would be clearer.

### Rename `intentUtils.ts`
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** The word "intent" isn't used elsewhere in the system. If this module is retained as-is (rather than split per the High Priority ticket), rename to something grounded in the system's vocabulary — e.g., `gestureUtils.ts` or `swipeUtils.ts`.

### Rename `pipelineType.ts` or split it
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `pipelineType.ts` is a catch-all containing `PointerEventPackage`, `InterpreterFn`, `EventMap`, and store function pick types. Either split by audience (bridge input types vs. store mutation types) or rename to something broader like `systemTypes.ts` so the scope is honest.

---

## Carried Forward from 2026-04-05
*Unresolved tickets from the previous review, preserved with developer context*

### Rename `onVolumeChange` to `onValueChange` in `Slider.tsx`
**Category:** Consistency
**Impact:** Medium
**Effort:** Low
**Details:** `Slider.tsx` exposes `onVolumeChange` — a domain-specific callback name. Carousel and Drag use the generic `onSwipeCommit`. Rename to `onValueChange` (or `onSwipeCommit` for full consistency) so the component is reusable beyond volume control use cases. Update all call sites.

> **Prior developer note (2026-04-05, //TODO //HELP):** "This is a bit tricky since the callback is currently volume-specific but the slider component is generic. Need to understand and build up a system from custom reactions." — Unresolved. Needs design decision on how custom reaction callbacks should work before renaming.

### Refactor `pipeline.orchestrate` store dispatch to a registry
**Category:** Scalability
**Impact:** Medium
**Effort:** Medium
**Details:** `pipeline.orchestrate` has a `switch` over descriptor type with similar boilerplate per case: get store state, look up function by event name, call it with ctx. A registry pattern (`Record<DataKeys, { getState: () => ... }>`) could eliminate the need to add a new case for each primitive.

> **Prior developer note (2026-04-05, //HACK deprioritized):** "The current implementation is straightforward and the switch statement is clear in its intent. The registry pattern adds indirection that may not be worth it until we have a larger number of primitives or more complex dispatch logic."
>
> **Prior AI note:** "A generic registry would force you to either lose per-primitive flexibility or add complexity to work around it. The switch is actually the right pattern here — it's explicit, TypeScript narrows correctly in each branch, and adding a fourth primitive is just adding a new case."
>
> Kept as a future consideration. Not actionable at current scale.

### Reduce Zustand subscription granularity in `use*Zustand` hooks
**Category:** Performance / State Management
**Impact:** Medium
**Effort:** Low
**Details:** Each `use*Zustand` hook subscribes to the entire state object for a given `id`. Use `useShallow` (already used in `sizeStore.ts`) or field-level selectors in `useCarouselZustand`, `useDragZustand`, and `useSliderZustand` to subscribe only to fields the component actually reads.

> **Prior developer note (2026-04-05, //SKIPPED):** "Doesn't really matter at the current scale and adds complexity. We can revisit if performance becomes an issue." — The 2026-04-07 analysis still flags coarse subscriptions causing re-renders on every pointermove during drags. Preserved in case performance becomes a concern.

### Eliminate the duplicated `type` field between `Descriptor` and `ctx`
**Category:** Consistency
**Impact:** Low
**Effort:** Medium
**Details:** Every `Descriptor` has a top-level `type` (e.g., `type: 'carousel'`) and a `ctx.type` (e.g., `ctx.type: 'carousel'`). These are always identical, creating a synchronization invariant.

> **Prior developer note (2026-04-05, //SKIPPED):** "This is a bit tricky since the `type` field on the descriptor is what allows us to discriminate the union and narrow to the correct solver, while the `ctx.type` is what the solvers use to determine which fields are valid. The `ctx.type` is derived from the descriptor's `type` at the point of building the descriptor. The potential fix would be to manually add `ctx.type` before dispatching to the stores/updater, but that might make it harder to narrow ctx." — Acknowledged. Keep as-is unless a clean solution emerges.

### Remove `actionId` from non-button descriptors
**Category:** Dead Code
**Impact:** Low
**Effort:** Low
**Details:** `buildBase` in `buildDesc.ts` attaches `actionId` to all descriptor types, but it's only meaningful for buttons (read from `data-action`). Move `actionId` into `buildButton` only, or make it button-specific in the `BaseInteraction` type.

> **Prior developer note (2026-04-05, //NOTE //HELP):** "actionId is for future extensibility since actions will be added to other primitives later. I believe it is for custom events to sliders for things like volume. Will have to analyse this further but I'm fairly sure it is to hook up custom events to Kotlin." — Do not remove. Kept for planned future use.

### Pool or share ResizeObservers across primitive instances
**Category:** Performance
**Impact:** Low
**Effort:** Medium
**Details:** Each primitive instance creates its own `ResizeObserver` (Slider creates one observing two elements). For the current scale (~10–20 primitives) this is fine. If the count grows significantly, consider a shared observer utility that batches observations into a single `ResizeObserver` instance with per-element callbacks.

> **Prior developer note (2026-04-05, //FUTURE):** Deferred. Not actionable at current scale.
