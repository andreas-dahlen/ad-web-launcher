# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

*All quick win tickets have been resolved.*

---

## High Priority
*High impact, higher effort or risk — plan these carefully*

*All high priority tickets have been resolved.*

---

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

*All low priority tickets have been resolved or consciously skipped.*

---

## Carried Forward from 2026-04-05
*Unresolved tickets from the previous review, preserved with developer context*

### Rename `onVolumeChange` to `onValueChange` in `Slider.tsx`
**Category:** Consistency
**Impact:** Medium
**Effort:** Low
**Details:** `Slider.tsx` exposes `onVolumeChange` — a domain-specific callback name. Carousel and Drag use the generic `onSwipeCommit`. Rename to `onValueChange` (or `onSwipeCommit` for full consistency) so the component is reusable beyond volume control use cases. Update all call sites.

> **Prior developer note (2026-04-05, //TODO //HELP):** "This is a bit tricky since the callback is currently volume-specific but the slider component is generic. Need to understand and build up a system from custom reactions." — Unresolved. Needs design decision on how custom reaction callbacks should work before renaming.

> **2026-04-09 code review note:** Confirmed still `onVolumeChange` in `SliderProps` (line 15) and used in the `onReaction` callback. The callback also performs vertical inversion (`max - (emitValue - min)`) and rounds to integer — both domain-specific behaviours that may need to be extracted if generalising.

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
