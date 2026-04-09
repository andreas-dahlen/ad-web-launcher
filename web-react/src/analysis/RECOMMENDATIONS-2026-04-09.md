# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

//PARTIAL `setThumbSize()` has the equality guard but `setSize()` still assigns unconditionally.
//NOTE also removed the undefined guard since size is Vec2 and should never be undefined.
### Add equality check to `sliderStore.setSize()` and `setThumbSize()`
**Category:** Performance
**Impact:** Medium
**Effort:** Low
**Details:** `carouselStore.setSize()` already checks `if (s.size.x === trackSize.x && s.size.y === trackSize.y) return` to avoid unnecessary re-renders. `sliderStore.setSize()` and `sliderStore.setThumbSize()` lack this check, meaning every ResizeObserver callback triggers a store update unconditionally. Add the same equality guard to both methods in `sliderStore.ts`.

//PARTIAL `//carousel only` removed, `//future me` addressed as `//FUTURE` tag. `//gestureUtils.js` stale file-name comment remains at line 7 of gestureUtils.ts.
//NOTE possibly need to harden typing for Axis in order for vectorUtils to enforce typing even more.
### Clean up stale comments
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** Remove `//intentUtils.js` at line 8 of `gestureUtils.ts` (leftover from a rename). Address or remove `//future me -> probably return pressCancel...` TODO in `interpreter.ts`. Remove `//carousel only` comment above `vector.resolveDirection()` in `vectorUtils.ts` — this documents a usage constraint that should be enforced by types, not comments.

---

## High Priority
*High impact, higher effort or risk — plan these carefully*

### Rename `onVolumeChange` to generic callback name
**Category:** Naming
**Impact:** Medium
**Effort:** Medium
**Details:** `onVolumeChange` in `Slider.tsx` leaks a specific use case ("volume") into the generic slider API. Rename to `onValueChange` or `onChange`. This requires updating `SliderProps`, the `Slider` component body, and all call sites that pass this prop. Note: the callback also performs vertical inversion (`max - (emitValue - min)`) and rounds to integer — both domain-specific behaviours that may need to be extracted if generalising.

> **Carried from 2026-04-05 → 2026-04-07 (//TODO //HELP):** "This is a bit tricky since the callback is currently volume-specific but the slider component is generic. Need to understand and build up a system from custom reactions." — Needs design decision on how custom reaction callbacks should work before renaming.

//SKIPPED Yeah, skip it. You don't have tests yet and when you do you can just add it then. Don't build test infrastructure for tests that don't exist.
### Add interpreter reset capability for testability
**Category:** Testability
**Impact:** Medium
**Effort:** Medium
**Details:** The `gestures` map in `interpreter.ts` is a module-level variable with no exported `reset()` or `clear()` function. Tests cannot reliably isolate gesture state between test cases without reloading the entire module. Export a `resetGestures()` function (or `__test__reset()` gated behind a flag) that clears the map.

---

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

//SKIPPED i don't agree. Delta1D makes it super easy to understand that this is a delta value that is a 1D number.
### Rename `delta1D` to a self-documenting name
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `delta1D` on `CtxCarousel` and `CtxSlider` in `ctxType.ts` is not self-documenting. It represents the axis-decomposed movement magnitude. Consider `axisDelta` or `primaryDelta` to match the `main`/`cross` vocabulary used elsewhere in the system.

//SKIPPED if we're talking about stores they all carry flat constraints. So no idea what this ticket is about.
### Unify constraint representation across stores
**Category:** Consistency
**Impact:** Low
**Effort:** Medium
**Details:** `dragStore` stores constraints as flat fields (`minX`, `maxX`, `minY`, `maxY`). `sliderStore` nests them (`{ min, max }`). `carouselStore` doesn't store constraints at all — they come from DOM `data-*` attributes. While each has functional reasons, the three different patterns make the system harder to learn. Consider a shared constraint convention — at minimum, align Drag and Slider to use the same structure.



//SKIPPED value is the right name for slider — it's the actual logical value (0-100 volume, etc), not a displacement. Carousel offset and drag offset are transient pixel-space displacements that get thrown away on commit. Slider value is the thing that persists. They're genuinely different concepts.
offset meaning "live displacement" is consistent across carousel and drag — the types differ because one is 1D and the other is 2D, which is correct. liveOffset adds a word without adding clarity. The real inconsistency is slider using value directly instead of a separate offset, but that's a behavioral difference not a naming problem.
### Unify offset naming across stores
**Category:** Consistency
**Impact:** Low
**Effort:** Medium
**Details:** Carousel uses `offset` (1D number representing live swipe displacement). Drag uses `offset` (Vec2 representing live drag displacement). Slider had `offset` (unused — to be removed per quick win above) and uses `value` for the committed position. The same conceptual field — "live displacement during gesture" — has different types and names. Consider aligning on a single naming convention, e.g., `liveOffset` (1D or 2D as appropriate) for the transient drag value.

//TODO // FUTURE
### Extract shared `useResizeObserver` hook
**Category:** Dead Code / Scalability
**Impact:** Low
**Effort:** Medium
**Details:** `useCarouselSizing`, `useDragSizing`, and `useSliderSizing` all follow the same pattern: create ResizeObserver → observe element(s) → measure dimensions → call store setter → disconnect on cleanup. Extract a shared `useResizeObserver(refs, callback)` hook to reduce duplication and provide a single place to add debouncing or observer pooling in the future.

//SKIPPED after earlier change this seems like an issue that would have to be reviewed if it is relevent at all anymore.
### Simplify `EventMap` type in pipelineType
**Category:** Dead Code
**Impact:** Low
**Effort:** Low
**Details:** `EventMap` in `pipelineType.ts` defines event-to-method-name tuples but is only consumed as `EventMap['carousel'][number]` to derive the Pick types. The tuple structure adds no value. Replace with direct Pick definitions: `Pick<CarouselStore, 'swipe' | 'swipeStart' | 'swipeCommit' | 'swipeRevert'>` etc., and remove `EventMap` entirely.

---

## Archived — Consciously Deferred or Skipped
*Tickets from prior reviews that were evaluated and intentionally deprioritised. Preserved for historical context.*

<!-- ### Refactor `pipeline.orchestrate` store dispatch to a registry
**Category:** Scalability
**Impact:** Medium
**Effort:** Medium
**Details:** `pipeline.orchestrate` has a `switch` over descriptor type with similar boilerplate per case: get store state, look up function by event name, call it with ctx. A registry pattern (`Record<DataKeys, { getState: () => ... }>`) could eliminate the need to add a new case for each primitive.

> **Prior developer note (2026-04-05, //HACK deprioritized):** "The current implementation is straightforward and the switch statement is clear in its intent. The registry pattern adds indirection that may not be worth it until we have a larger number of primitives or more complex dispatch logic."
>
> **Prior AI note:** "A generic registry would force you to either lose per-primitive flexibility or add complexity to work around it. The switch is actually the right pattern here — it's explicit, TypeScript narrows correctly in each branch, and adding a fourth primitive is just adding a new case."
>
> Kept as a future consideration. Not actionable at current scale.

> **2026-04-09 code review note:** Confirmed the switch in `pipeline.ts` still has four explicit branches (carousel, slider, drag, button). Each branch follows the same pattern: run solver, spread result into ctx, conditionally call store method. The only asymmetry is the slider branch which also calls `interpreter.applyGestureUpdate()`. A registry could unify the common path, but would need a carve-out for slider's gestureUpdate step. -->

<!-- ### Eliminate the duplicated `type` field between `Descriptor` and `ctx`
**Category:** Consistency
**Impact:** Low
**Effort:** Medium
**Details:** Every `Descriptor` has a top-level `type` (e.g., `type: 'carousel'`) and a `ctx.type` (e.g., `ctx.type: 'carousel'`). These are always identical, creating a synchronization invariant.

> **Prior developer note (2026-04-05, //SKIPPED):** "This is a bit tricky since the `type` field on the descriptor is what allows us to discriminate the union and narrow to the correct solver, while the `ctx.type` is what the solvers use to determine which fields are valid. The `ctx.type` is derived from the descriptor's `type` at the point of building the descriptor. The potential fix would be to manually add `ctx.type` before dispatching to the stores/updater, but that might make it harder to narrow ctx." — Acknowledged. Keep as-is unless a clean solution emerges.

> **2026-04-09 code review note:** Still present. `pipeline.orchestrate` destructures `desc.type` for the switch, then passes `desc.ctx` (which carries its own `type`) onward to stores and `domUpdater`. Both `CtxType` (discriminated on `ctx.type`) and `Descriptor` (discriminated on `type`) need their own discriminant for independent narrowing. The duplication is a structural consequence of having two separate union types — removing it would require merging them or adding a runtime step to inject `type` into ctx before dispatch. -->

<!-- ### Remove `actionId` from non-button descriptors
**Category:** Dead Code
**Impact:** Low
**Effort:** Low
**Details:** `buildBase` in `buildDesc.ts` attaches `actionId` to all descriptor types, but it's only meaningful for buttons (read from `data-action`). Move `actionId` into `buildButton` only, or make it button-specific in the `BaseInteraction` type.

> **Prior developer note (2026-04-05, //NOTE //HELP):** "actionId is for future extensibility since actions will be added to other primitives later. I believe it is for custom events to sliders for things like volume. Will have to analyse this further but I'm fairly sure it is to hook up custom events to Kotlin." — Do not remove. Kept for planned future use.

> **2026-04-09 code review note:** `actionId` is still on `BaseInteraction` in `baseType.ts` (optional field). Currently only populated from `data-action` in `buildContext` and only semantically meaningful for buttons. No other code reads it. If the planned Kotlin bridge use case materialises, this is correctly positioned; otherwise it's inert. -->

<!-- ### Pool or share ResizeObservers across primitive instances
**Category:** Performance
**Impact:** Low
**Effort:** Medium
**Details:** Each primitive instance creates its own `ResizeObserver` (Slider creates one observing two elements). For the current scale (~10–20 primitives) this is fine. If the count grows significantly, consider a shared observer utility that batches observations into a single `ResizeObserver` instance with per-element callbacks.

> **Prior developer note (2026-04-05, //FUTURE):** Deferred. Not actionable at current scale.

> **2026-04-09 code review note:** Confirmed: `useCarouselSizing` creates 1 observer (1 element), `useDragSizing` creates 1 observer (2 elements: item + container), `useSliderSizing` creates 1 observer (2 elements: track + thumb). Each instantiated per component mount. Still fine at current scale. -->
