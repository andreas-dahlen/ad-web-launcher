# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

//HELP data-swipe and data-press are on elements through domUpdater. data-modifiable is not on any element and is removed. However might be worth to do a thorough search for data-swipe and data-press to see if they are actually used anywhere in the system. If they are not used, we can remove them as well. If they are used, we should consider if they are necessary or if there is a better way to handle those interactions without relying on data attributes that may not be consistently applied.
### Remove dead `data-swipe` and `data-modifiable` checks from `buildReactions`
**Category:** Dead Code
**Impact:** Medium
**Effort:** Low
**Details:** `buildReactions` in `buildDesc.ts` checks `ds.swipe` and `ds.modifiable`, but no current component sets `data-swipe` or `data-modifiable` attributes. These checks are either remnants of removed functionality or aspirational. Remove them to reduce confusion about which `data-*` attributes are actually in use.

//SKIPPED I'd push back on this ticket entirely. You're at ~10 gestures max in a launcher app. The allocation cost of Object.keys on a map that never exceeds 10 entries is genuinely negligible. This is micro-optimization for no real gain.
What you have now is actually the right logic — evict oldest PENDING first, fall back to entries[0]. --- Claude.io

### Replace `Object.keys(gestures).length` with a counter
**Category:** Performance
**Impact:** Medium
**Effort:** Low
**Details:** `interpreter.onDown` calls `Object.keys(gestures).length > 10` on every pointer down, allocating a temporary array. Add a module-level `let gestureCount = 0` that increments in `onDown` and decrements in `deleteGesture`/`finalizeGesture`. Check `gestureCount > 10` instead.

---

## High Priority
*High impact, higher effort or risk — plan these carefully*
//SKIPPED This is asking you to make solvers required for every event in EVENT_MAP. But look at what that would mean for carousel — it would need to handle swipeRevert, which currently has no solver (and shouldn't, since revert is store-only with no solver logic needed).
The Partial is intentional. Missing handlers fall through to undefined in the pipeline via optional chaining, which is the correct behavior for events that need no solver computation.
The real value here would be ensuring solvers don't handle events outside their EVENT_MAP — but that's a much weaker risk since TypeScript already constrains the keys to EventType.
I'd skip this ticket. The typing is correct as-is, and enforcing required keys would force dummy implementations just to satisfy the type.
### Tighten solver typing to match `EVENT_MAP`
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** All three solvers are typed as `Partial<Record<EventType, (desc) => XCtxPartial>>`. This means the compiler cannot verify that a solver handles exactly the events declared in `pipelineType.ts`'s `EVENT_MAP`. A missing handler is invisible at compile time. Define per-primitive solver interfaces that require exactly the event keys from `EVENT_MAP` — e.g., `type CarouselSolverFn = { [K in typeof EVENT_MAP.carousel[number]]: (desc: CarouselDesc) => CarouselCtxPartial }`. Apply these to `carouselSolver`, `sliderSolver`, and `dragSolver`.


//SKIPPED I'd keep it but downgrade impact to Low. The runtime guard is solid, the cast is confined to one place, and fixing it properly requires the solver typing work first. Not worth doing in isolation. - Claude.io
### Eliminate `as keyof XFunctions` cast in `pipeline.ts`
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** In `pipeline.ts`, after the solver spread `ctx = { ...ctx, ...sr }`, `ctx.event` may have been overridden (e.g., carousel solver returns `{ event: 'swipeRevert' }`). The pipeline then casts `ctx.event as keyof CarouselFunctions` to index into the store. This is guarded at runtime by `CAROUSEL_EVENTS.has()`, but the type system does not prove correctness. If solver typing is tightened (see above), the solver return type can explicitly narrow which events it may produce, allowing the pipeline to derive the store method key without a cast.

//SKIPPED This was skipped before for good reason — added complexity at current scale.
But there's a more specific argument against it now: looking at useCarouselStore, the component actually does use settling (passed to useCarouselMotion to control transition). And pendingDir is intentionally not returned from the hook. So the separation is already partially done by what the hook chooses to return.
For drag, minX/maxX/minY/maxY changing mid-gesture would be unusual — constraints are set once on mount via ResizeObserver. Not a real re-render concern in practice.
Skip it again. The previous reasoning still holds. - Claude.io
### Reduce subscription granularity in `use[X]Store` hooks
**Category:** State Management / Performance
**Impact:** Medium
**Effort:** Medium
**Details:** Each `use[X]Store` hook subscribes to the entire binding via `useShallow(s => s.bindings[id] ?? DEFAULTS)`. This means internal bookkeeping fields trigger re-renders — e.g., `settling` and `pendingDir` in carousel, `minX`/`maxX`/`minY`/`maxY` in drag. Split subscriptions into two selectors: one for render-relevant fields (returned to the component) and one for internal fields (not subscribed). Alternatively, restructure the binding types to separate reactive from non-reactive fields.

//SKIPPED - see 2026-04-09 comment. This is test infrastructure for tests that don't exist yet. Premature optimisation.
### Add `reset()` / `clearAll()` to `interpreter` for testability
**Category:** Testability
**Impact:** Medium
**Effort:** Low
**Details:** `interpreter.ts` has module-level mutable state in the `gestures` object. The only cleanup API is `deleteGesture(pointerId)` — there is no way to reset all state between tests. Export a `resetGestures()` function (or `__test__reset()` gated behind a flag) that clears the map (and the gesture counter, if the performance ticket above is applied). This prevents cross-test contamination.

> **Carried from 2026-04-09 (//SKIPPED):** Developer noted "You don't have tests yet and when you do you can just add it then. Don't build test infrastructure for tests that don't exist." Valid reasoning — this becomes actionable only when test authoring begins.

---

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

//SKIPPED added a comment about doing gestureUpdate.slider a discriminating union later if we find other types of gesture updates in the future. For now it is not worth the effort since it is only used in one place and the slider-specific fields are obvious enough with the current naming. If we find ourselves adding more fields that are only relevant for certain event types, we can revisit this and consider a more structured approach to the gesture update types. - Claude.io
### Move `GestureUpdate` to slider-specific types
**Category:** Dead Code / Naming
**Impact:** Low
**Effort:** Low
**Details:** `GestureUpdate` in `dataType.ts` has fields `sliderStartOffset` and `sliderValuePerPixel` — it is slider-specific. It is only constructed by `sliderSolver`, applied by `interpreter.applyGestureUpdate` (gated on `desc.type === 'slider'`), and consumed by `sliderUtils.resolveSwipe`. Move it out of shared `dataType.ts` into a slider-specific location (e.g., `sliderSolver.ts` or a new `sliderTypes.ts`) or rename it to `SliderGestureUpdate`.

//SKIPPED  the shared logic is like 3 lines and the two functions differ enough in what they add (slider also adds thumb sizes) that extracting it would just create indirection for no real gain. - claude.io
### Extract shared normalize pattern from `carouselUtils` and `sliderUtils`
**Category:** Dead Code / Consistency
**Impact:** Low
**Effort:** Low
**Details:** `carouselUtils.normalize` and `sliderUtils.normalize` share identical structure: call `normalizeBase(desc.base, desc.ctx.delta)`, then add `mainSize`/`crossSize` from their respective size data. This could be extracted into a shared helper in `axisUtils.ts` that accepts a `size: Vec2` parameter, reducing duplication and enforcing consistency.

//SKIPPED The file is small and all four functions are consumed together in the interpreter. Splitting would create 2-3 files with 1-2 functions each for no real organizational benefit. - Claude.io
### Split `gestureUtils` into focused modules
**Category:** Separation of Concerns
**Impact:** Low
**Effort:** Medium
**Details:** `gestureUtils` mixes normalization (`normalizedDelta`), axis resolution (`resolveAxis`), threshold detection (`swipeThresholdCalc`), and a type guard (`isSwipeableDescriptor`). These serve different concerns — math, config, and type narrowing. Consider splitting into `normalizeUtils` (or inlining into `axisUtils`), keeping threshold in `gestureUtils`, and moving `isSwipeableDescriptor` to `descriptor.ts` or a dedicated type guard file.

//SKIPPED I know this is true but i feel like after now adding all prop types to the propsType.ts file it is now fairly self documenting. The data attributes are all in the same place and the props types are all in the same place. Adding a doc contract would be another source of truth to maintain and could easily get out of sync with the actual implementation. I think it's better to just have good documentation in the code and keep the data attributes well organized and named consistently. - Claude.io
### Document `data-*` attribute contract
**Category:** Naming / Scalability
**Impact:** Low
**Effort:** Low
**Details:** The system relies on `data-type`, `data-id`, `data-axis`, `data-press`, `data-react-press`, `data-swipe`, `data-react-swipe`, `data-locked`, `data-snap-x`, `data-snap-y`, `data-lock-prev-at`, `data-lock-next-at`, `data-swiping`, `data-pressed`, `data-action`, and more. These are the system's public API surface between React components and the interaction engine. There is no single reference for which attributes exist, what they do, and which are required vs optional. A brief contract document (or a TypeScript interface with JSDoc) would improve discoverability for new developers and reduce the risk of typos.

/SKIPPED The three sizing hooks observe different numbers of elements and call different store setters with different data shapes. A shared useResizeObserver would just be a thin wrapper around the observer lifecycle — saving maybe 5 lines per hook while adding an abstraction layer.
Skip it. The duplication is minimal and the hooks are simple enough that the "single place for future debouncing" argument doesn't justify it yet. - Claude.io
### Extract shared `useResizeObserver` hook
**Category:** Dead Code / Scalability
**Impact:** Low
**Effort:** Medium
**Details:** `useCarouselSizing`, `useDragSizing`, and `useSliderSizing` all follow the same pattern: create ResizeObserver → observe element(s) → measure dimensions → call store setter → disconnect on cleanup. Extract a shared `useResizeObserver(refs, callback)` hook to reduce duplication and provide a single place to add debouncing or observer pooling in the future.

> **Carried from 2026-04-09 (//TODO //FUTURE):** Acknowledged as future work. Not urgent at current scale.

---

## Archived — Consciously Deferred or Skipped
*Tickets from prior reviews that were evaluated and intentionally deprioritised. Preserved for historical context.*

<!-- ### Rename `delta1D` to a self-documenting name
**Category:** Naming
**Impact:** Low
**Effort:** Low

> **Prior developer note (2026-04-09, //SKIPPED):** "Delta1D makes it super easy to understand that this is a delta value that is a 1D number." — Developer disagrees with the recommendation. Removed from active recommendations. -->

<!-- ### Unify constraint representation across stores
**Category:** Consistency
**Impact:** Low
**Effort:** Medium

> **Prior developer note (2026-04-09, //SKIPPED):** "If we're talking about stores they all carry flat constraints. So no idea what this ticket is about." — Developer does not see the inconsistency as meaningful. Removed from active recommendations. -->

<!-- ### Unify offset naming across stores
**Category:** Consistency
**Impact:** Low
**Effort:** Medium

> **Prior developer note (2026-04-09, //SKIPPED):** "value is the right name for slider — it's the actual logical value (0-100 volume, etc), not a displacement. Carousel offset and drag offset are transient pixel-space displacements that get thrown away on commit. Slider value is the thing that persists. They're genuinely different concepts. offset meaning 'live displacement' is consistent across carousel and drag." — Strong reasoning. Removed from active recommendations. -->

<!-- ### Simplify `EventMap` type in pipelineType
**Category:** Dead Code
**Impact:** Low
**Effort:** Low

> **Prior developer note (2026-04-09, //SKIPPED):** "After earlier change this seems like an issue that would have to be reviewed if it is relevant at all anymore." — Deferred pending review. -->

<!-- ### Refactor `pipeline.orchestrate` store dispatch to a registry
**Category:** Scalability
**Impact:** Medium
**Effort:** Medium

> **Prior developer note (2026-04-05, //HACK deprioritized):** "The current implementation is straightforward and the switch statement is clear in its intent." Not actionable at current scale. -->

<!-- ### Eliminate the duplicated `type` field between `Descriptor` and `ctx`
**Category:** Consistency
**Impact:** Low
**Effort:** Medium

> **Prior developer note (2026-04-05, //SKIPPED):** Structural consequence of having two separate union types. Keep as-is unless a clean solution emerges. -->

<!-- ### Remove `actionId` from non-button descriptors
**Category:** Dead Code
**Impact:** Low
**Effort:** Low

> **Prior developer note (2026-04-05, //NOTE //HELP):** "actionId is for future extensibility since actions will be added to other primitives later." — Do not remove. Kept for planned future use. -->

<!-- ### Pool or share ResizeObservers across primitive instances
**Category:** Performance
**Impact:** Low
**Effort:** Medium

> **Prior developer note (2026-04-05, //FUTURE):** Deferred. Not actionable at current scale. -->
