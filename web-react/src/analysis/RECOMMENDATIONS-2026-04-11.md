# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

### Remove commented-out dead code in `carouselStore` and `useSliderMotion`
**Category:** Dead Code
**Impact:** Medium
**Effort:** Low
**Details:** `carouselStore.ts` lines 75–91 contain a commented-out `setPosition` method. The active `swipeStart` method now handles index advancement when `pendingDir !== null`, making the commented method a historical artifact. Similarly, `useSliderMotion.ts` lines 14–16 contain a commented-out `BASE_STYLE` const with `willChange: "transform"`. Both should be removed to reduce noise.

### Guard `usable === 0` in `sliderUtils.resolveStart`
**Category:** Error Handling
**Impact:** Medium
**Effort:** Low
**Details:** `sliderUtils.resolveStart` in `solverUtils/sliderUtils.ts` computes `(mainOffset - mainThumbSize / 2) / usable`. When `usable` is 0 (track size equals thumb size), this division produces `Infinity`. The subsequent `vector.clamp(ratio, 0, 1)` clamps it to `1`, yielding `max` as the value — technically safe but semantically wrong. A zero-usable slider should return early (e.g., return `undefined` or `{ value: min, valuePerPixel: 0 }`). The existing `if (!usable) return` guard on the line above checks for falsy, but `0` is falsy so this actually already guards the case — verify this is the intended behavior and document it, or change to an explicit `usable === 0` check.

//HELP data-swipe and data-press are on elements through domUpdater. data-modifiable is not on any element and is removed. However might be worth to do a thorough search for data-swipe and data-press to see if they are actually used anywhere in the system. If they are not used, we can remove them as well. If they are used, we should consider if they are necessary or if there is a better way to handle those interactions without relying on data attributes that may not be consistently applied.
### Resolve `data-swipe` check in `buildCapabilities`
**Category:** Dead Code
**Impact:** Medium
**Effort:** Low
**Details:** `buildDesc.buildCapabilities` in `buildDesc.ts` checks `ds.swipe !== undefined` when computing `swipeable`. No current component (`Carousel.tsx`, `Drag.tsx`, `Slider.tsx`, `Button.tsx`) sets a `data-swipe` attribute — they use `data-react-swipe`, `data-react-swipe-start`, or `data-react-swipe-commit` instead. Determine whether `data-swipe` is an intentional public API surface for enabling swipeability without React reactivity, or a remnant. If intentional, document it. If dead, remove the check.

---

## High Priority
*High impact, higher effort or risk — plan these carefully*

//SKIPPED This is asking you to make solvers required for every event in EVENT_MAP. But look at what that would mean for carousel — it would need to handle swipeRevert, which currently has no solver (and shouldn't, since revert is store-only with no solver logic needed). The Partial is intentional. Missing handlers fall through to undefined in the pipeline via optional chaining, which is the correct behavior for events that need no solver computation. I'd skip this ticket. The typing is correct as-is, and enforcing required keys would force dummy implementations just to satisfy the type. — Developer (2026-04-10)
### Tighten solver typing to match `EVENT_MAP`
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** All three solvers are typed as `Partial<Record<EventType, (desc) => XCtxPartial>>`. This means the compiler cannot verify that a solver handles exactly the events declared in `pipelineType.ts`'s `EVENT_MAP`. A missing handler is invisible at compile time, and an extraneous handler for the wrong event won't error. Define per-primitive solver interfaces that require exactly the event keys from `EVENT_MAP` — e.g., `type CarouselSolverFn = { [K in (typeof EVENT_MAP)['carousel'][number]]: (desc: CarouselDesc) => CarouselCtxPartial }`. Apply these to `carouselSolver`, `sliderSolver`, and `dragSolver`.

//SKIPPED I'd keep it but downgrade impact to Low. The runtime guard is solid, the cast is confined to one place, and fixing it properly requires the solver typing work first. Not worth doing in isolation. — Developer (2026-04-10)
### Eliminate `as keyof XFunctions` cast in `pipeline.ts`
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** In `pipeline.ts`, after the solver spread `ctx = { ...ctx, ...sr }`, the pipeline casts `ctx.event as keyof CarouselFunctions` (and equivalents for slider/drag) to index into the store. The cast is guarded at runtime by `CAROUSEL_EVENTS.has()`, but the type system does not prove correctness. If solver typing is tightened (see above), the solver return type can explicitly narrow which events it may produce, allowing the pipeline to derive the store method key without a cast. This ticket depends on the solver typing ticket.

//SKIPPED This was skipped before for good reason — added complexity at current scale. But there's a more specific argument against it now: looking at useCarouselStore, the component actually does use settling (passed to useCarouselMotion to control transition). And pendingDir is intentionally not returned from the hook. So the separation is already partially done by what the hook chooses to return. For drag, minX/maxX/minY/maxY changing mid-gesture would be unusual — constraints are set once on mount via ResizeObserver. Not a real re-render concern in practice. — Developer (2026-04-10)
### Reduce subscription granularity in `use[X]Store` hooks
**Category:** State Management / Performance
**Impact:** Medium
**Effort:** Medium
**Details:** Each `use[X]Store` hook subscribes to the entire binding via `useShallow(s => s.bindings[id] ?? DEFAULTS)`. Internal bookkeeping fields trigger re-renders — e.g., `pendingDir` in carousel, constraint fields in drag. While `settling` is consumed by `useCarouselMotion` (justified), `pendingDir` is not returned from the hook yet still triggers shallow comparison. Consider splitting subscriptions: one selector for render-relevant fields, another for internal-only fields. Alternatively, restructure binding types to separate reactive from non-reactive fields.

//SKIPPED - see 2026-04-09 comment. This is test infrastructure for tests that don't exist yet. Premature optimisation. — Developer (2026-04-10)
### Add `reset()` to `interpreter` for testability
**Category:** Testability
**Impact:** Medium
**Effort:** Low
**Details:** `interpreter.ts` has module-level mutable state in the `gestures` object. The only cleanup API is `deleteGesture(pointerId)` — there is no way to reset all state between tests. Export a `resetGestures()` function that clears the map. This prevents cross-test contamination. Becomes actionable when test authoring begins.

> **Carried from 2026-04-09 (//SKIPPED):** Developer noted "You don't have tests yet and when you do you can just add it then. Don't build test infrastructure for tests that don't exist." Valid reasoning — this becomes actionable only when test authoring begins.

---

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

### Add `id` uniqueness validation in `use[X]Store` hooks
**Category:** Error Handling
**Impact:** Low
**Effort:** Low
**Details:** All stores use `id` as the binding key. If two component instances share the same `id`, they silently read/write the same store binding with no warning. Add a `dev`-mode check in the `use[X]Store` hooks (or in the store `init` methods) that warns when an `init` call occurs for an `id` that is already bound and not yet deleted — indicating a duplicate.

//SKIPPED I'd push back on this ticket entirely. You're at ~10 gestures max in a launcher app. The allocation cost of Object.keys on a map that never exceeds 10 entries is genuinely negligible. This is micro-optimization for no real gain. What you have now is actually the right logic — evict oldest PENDING first, fall back to entries[0]. — Developer (2026-04-10)
### Replace `Object.keys(gestures).length` with a counter
**Category:** Performance
**Impact:** Low
**Effort:** Low
**Details:** `interpreter.onDown` calls `Object.keys(gestures).length > 10` on every pointer down, allocating a temporary array. Add a module-level `let gestureCount = 0` that increments in `onDown` and decrements in `deleteGesture`/`finalizeGesture`.

//SKIPPED Added a comment about doing gestureUpdate.slider a discriminating union later if we find other types of gesture updates in the future. For now it is not worth the effort since it is only used in one place and the slider-specific fields are obvious enough with the current naming. — Developer (2026-04-10)
### Move `GestureUpdate` to slider-specific scope
**Category:** Naming / Dead Code
**Impact:** Low
**Effort:** Low
**Details:** `GestureUpdate` in `dataType.ts` has fields `sliderStartOffset` and `sliderValuePerPixel` — it is slider-specific. It is only constructed by `sliderSolver`, only applied by `interpreter.applyGestureUpdate` (gated on `desc.type === 'slider'`), and only consumed by `sliderUtils.resolveSwipe`. Move it to a slider-specific location or rename to `SliderGestureUpdate`.

//SKIPPED The shared logic is like 3 lines and the two functions differ enough in what they add (slider also adds thumb sizes) that extracting it would just create indirection for no real gain. — Developer (2026-04-10)
### Extract shared normalize pattern from `carouselUtils` and `sliderUtils`
**Category:** Consistency / Dead Code
**Impact:** Low
**Effort:** Low
**Details:** `carouselUtils.normalize` and `sliderUtils.normalize` share identical structure: call `normalizeBase(desc.base, desc.ctx.delta)`, then add `mainSize`/`crossSize` from their respective size data. This could be extracted into a shared helper in `axisUtils.ts` that accepts a `size: Vec2` parameter.

//SKIPPED The file is small and all four functions are consumed together in the interpreter. Splitting would create 2-3 files with 1-2 functions each for no real organizational benefit. — Developer (2026-04-10)
### Split `gestureUtils` into focused modules
**Category:** Separation of Concerns
**Impact:** Low
**Effort:** Medium
**Details:** `gestureUtils.ts` mixes normalization (`normalizedDelta`), axis resolution (`resolveAxis`), threshold detection (`swipeThresholdCalc`), and a type guard (`isSwipeableDescriptor`). These serve different concerns — math, config reading, and type narrowing. Additionally, `gestureUtils` imports from `sizeStore`, making "utility" functions dependent on store state. Consider splitting into focused helpers.

//SKIPPED I know this is true but i feel like after now adding all prop types to the propsType.ts file it is now fairly self documenting. The data attributes are all in the same place and the props types are all in the same place. Adding a doc contract would be another source of truth to maintain and could easily get out of sync with the actual implementation. — Developer (2026-04-10)
### Document `data-*` attribute contract
**Category:** Naming / Scalability
**Impact:** Low
**Effort:** Low
**Details:** The system relies on `data-type`, `data-id`, `data-axis`, `data-press`, `data-react-press`, `data-swipe`, `data-react-swipe`, `data-locked`, `data-snap-x`, `data-snap-y`, `data-lock-prev-at`, `data-lock-next-at`, `data-swiping`, `data-pressed`, `data-action`, and more. These are the system's public API surface between React components and the interaction engine. There is no single reference for which attributes exist, what they do, and which are required vs optional.

//SKIPPED The three sizing hooks observe different numbers of elements and call different store setters with different data shapes. A shared useResizeObserver would just be a thin wrapper around the observer lifecycle — saving maybe 5 lines per hook while adding an abstraction layer. Skip it. The duplication is minimal and the hooks are simple enough that the "single place for future debouncing" argument doesn't justify it yet. — Developer (2026-04-10)
### Extract shared `useResizeObserver` hook
**Category:** Scalability / Dead Code
**Impact:** Low
**Effort:** Medium
**Details:** `useCarouselSizing`, `useDragSizing`, and `useSliderSizing` all follow the same pattern: create ResizeObserver → observe element(s) → measure dimensions → call store setter → disconnect on cleanup. A shared `useResizeObserver(refs, callback)` hook would reduce duplication and provide a single place for future debouncing.

> **Carried from 2026-04-09 (//TODO //FUTURE):** Acknowledged as future work. Not urgent at current scale.

### Fix `APP_SETTINGS.hysteresis` comment
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `APP_SETTINGS.hysteresis` in `appSettings.ts` has the comment "gitter removal for gating to remove gitters". This is confusing — the value is a pixel threshold used in `exceedsCrossRange()` in `axisUtils.ts` to gate out cross-axis drift during swipes. The comment should reflect the actual purpose.

---

## Archived — Consciously Deferred or Skipped
*Tickets from prior reviews that were evaluated and intentionally deprioritised. Preserved for historical context.*

<!-- ### Rename `delta1D` to a self-documenting name
**Category:** Naming
**Impact:** Low
**Effort:** Low

> **Prior developer note (2026-04-09, //SKIPPED):** "Delta1D makes it super easy to understand that this is a delta value that is a 1D number." — Developer disagrees with the recommendation. -->

<!-- ### Unify constraint representation across stores
**Category:** Consistency
**Impact:** Low
**Effort:** Medium

> **Prior developer note (2026-04-09, //SKIPPED):** "If we're talking about stores they all carry flat constraints. So no idea what this ticket is about." -->

<!-- ### Unify offset naming across stores
**Category:** Consistency
**Impact:** Low
**Effort:** Medium

> **Prior developer note (2026-04-09, //SKIPPED):** "value is the right name for slider — it's the actual logical value (0-100 volume, etc), not a displacement." — Strong reasoning. -->

<!-- ### Refactor `pipeline.orchestrate` store dispatch to a registry
**Category:** Scalability
**Impact:** Medium
**Effort:** Medium

> **Prior developer note (2026-04-05, //HACK deprioritized):** "The current implementation is straightforward and the switch statement is clear in its intent." -->

<!-- ### Eliminate the duplicated `type` field between `Descriptor` and `ctx`
**Category:** Consistency
**Impact:** Low
**Effort:** Medium

> **Prior developer note (2026-04-05, //SKIPPED):** Structural consequence of having two separate union types. -->

<!-- ### Remove `actionId` from non-button descriptors
**Category:** Dead Code
**Impact:** Low
**Effort:** Low

> **Prior developer note (2026-04-05, //NOTE //HELP):** "actionId is for future extensibility since actions will be added to other primitives later." -->

<!-- ### Pool or share ResizeObservers across primitive instances
**Category:** Performance
**Impact:** Low
**Effort:** Medium

> **Prior developer note (2026-04-05, //FUTURE):** Not actionable at current scale. -->
