# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

### Fix or remove `onTransitionEnd` class guard in carousel
**Category:** Error Handling / Dead Code
**Impact:** High
**Effort:** Low
**Details:** `useCarouselMotion`'s `onTransitionEnd` callback checks `target.classList.contains("scene-default")`, but `Carousel.tsx` never assigns `"scene-default"` to any slot wrapper `<div>`. If child `<Scene />` components also lack this class, `carouselStore.setPosition(id)` is never called via the transition-end path, meaning carousel `index` never advances after a commit animation. Either add `className="scene-default"` to the slot wrapper divs in `Carousel.tsx`, or remove the class guard from `useCarouselMotion` and guard on a different signal (e.g., `data-role="current"`).

### Add `NaN` guards to `buildContext` numeric conversions
**Category:** Error Handling
**Impact:** High
**Effort:** Low
**Details:** `buildContext` in `buildContext.ts` converts `data-snapX`, `data-snapY`, `data-lockPrevAt`, and `data-lockNextAt` via `Number()` without checking for `NaN`. A non-numeric attribute string produces `NaN` that propagates silently through solver math (e.g., `carouselUtils.isLocked`, `dragUtils.resolveSnapAdjustment`). Add `Number.isFinite()` guards at the conversion site, returning `null` for invalid values.

### Remove dead `Reactions.modifiable` field
**Category:** Dead Code
**Impact:** Medium
**Effort:** Low
**Details:** `buildReactions` in `buildDesc.ts` computes `modifiable` from `data-modifiable`, `data-snapX`, `data-snapY`, `data-lockPrevAt`, `data-lockNextAt`, and `data-locked`. No code in the pipeline, solvers, or stores ever reads `reactions.modifiable`. The snap and lock logic is handled directly via `DomContext` fields and descriptor data. Remove `modifiable` from the `Reactions` interface in `baseType.ts` and its computation in `buildReactions`.

### Remove dead `data-swipe` and `data-modifiable` checks from `buildReactions`
**Category:** Dead Code
**Impact:** Medium
**Effort:** Low
**Details:** `buildReactions` in `buildDesc.ts` checks `ds.swipe` and `ds.modifiable`, but no current component sets `data-swipe` or `data-modifiable` attributes. These checks are either remnants of removed functionality or aspirational. Remove them to reduce confusion about which `data-*` attributes are actually in use.

### Add equality check to `sliderStore.setSize()`
**Category:** Performance
**Impact:** Medium
**Effort:** Low
**Details:** `carouselStore.setSize()` already checks `if (s.size.x === trackSize.x && s.size.y === trackSize.y) return` to avoid unnecessary re-renders. `sliderStore.setSize()` still assigns unconditionally on every ResizeObserver callback. Add the same equality guard. (`setThumbSize()` was fixed in a prior pass and already has the guard.)

> **Carried from 2026-04-09 (//PARTIAL):** `setThumbSize()` guard was added; `setSize()` still needs it.

### Clean up remaining stale comment in `gestureUtils.ts`
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `gestureUtils.ts` line 7 still has the stale `//gestureUtils.js` file-name comment (leftover from a JS→TS rename). Remove it.

> **Carried from 2026-04-09 (//PARTIAL):** `//carousel only` and `//future me` were addressed; this one remains.

### Change `GestureMap` type to `Partial<Record<number, GestureState>>`
**Category:** Type Safety
**Impact:** Medium
**Effort:** Low
**Details:** `interpreter.ts` defines `GestureMap` as `Record<number, GestureState>`, which tells TypeScript a value always exists for any numeric key. The code guards with `if (!g) return null` but the type doesn't enforce this. Change to `Partial<Record<number, GestureState>>` (or `Map<number, GestureState>`) so that accessing `gestures[pointerId]` correctly types as `GestureState | undefined`, making null guards compiler-enforced.

### Replace `Object.keys(gestures).length` with a counter
**Category:** Performance
**Impact:** Medium
**Effort:** Low
**Details:** `interpreter.onDown` calls `Object.keys(gestures).length > 10` on every pointer down, allocating a temporary array. Add a module-level `let gestureCount = 0` that increments in `onDown` and decrements in `deleteGesture`/`finalizeGesture`. Check `gestureCount > 10` instead.

---

## High Priority
*High impact, higher effort or risk — plan these carefully*

### Tighten solver typing to match `EVENT_MAP`
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** All three solvers are typed as `Partial<Record<EventType, (desc) => XCtxPartial>>`. This means the compiler cannot verify that a solver handles exactly the events declared in `pipelineType.ts`'s `EVENT_MAP`. A missing handler is invisible at compile time. Define per-primitive solver interfaces that require exactly the event keys from `EVENT_MAP` — e.g., `type CarouselSolverFn = { [K in typeof EVENT_MAP.carousel[number]]: (desc: CarouselDesc) => CarouselCtxPartial }`. Apply these to `carouselSolver`, `sliderSolver`, and `dragSolver`.

### Eliminate `as keyof XFunctions` cast in `pipeline.ts`
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** In `pipeline.ts`, after the solver spread `ctx = { ...ctx, ...sr }`, `ctx.event` may have been overridden (e.g., carousel solver returns `{ event: 'swipeRevert' }`). The pipeline then casts `ctx.event as keyof CarouselFunctions` to index into the store. This is guarded at runtime by `CAROUSEL_EVENTS.has()`, but the type system does not prove correctness. If solver typing is tightened (see above), the solver return type can explicitly narrow which events it may produce, allowing the pipeline to derive the store method key without a cast.

### Guard against division-by-zero in solver math
**Category:** Error Handling
**Impact:** High
**Effort:** Medium
**Details:** `sliderUtils.resolveStart` computes `(mainOffset - mainThumbSize / 2) / usable` where `usable = mainSize - mainThumbSize`. If track size equals thumb size, `usable` is zero, producing `Infinity` or `NaN`. Similarly, `useSliderMotion` computes `(value - min) / range` where `range = max - min || 1` — the `|| 1` fallback exists here but not in the solver. Add zero-guards to `sliderUtils.resolveStart` and audit `carouselUtils.shouldCommit` (divides by `laneSize`).

### Reduce subscription granularity in `use[X]Store` hooks
**Category:** State Management / Performance
**Impact:** Medium
**Effort:** Medium
**Details:** Each `use[X]Store` hook subscribes to the entire binding via `useShallow(s => s.bindings[id] ?? DEFAULTS)`. This means internal bookkeeping fields trigger re-renders — e.g., `settling` and `pendingDir` in carousel, `minX`/`maxX`/`minY`/`maxY` in drag. Split subscriptions into two selectors: one for render-relevant fields (returned to the component) and one for internal fields (not subscribed). Alternatively, restructure the binding types to separate reactive from non-reactive fields.

### Rename `onVolumeChange` to generic callback name
**Category:** Naming
**Impact:** Medium
**Effort:** Medium
**Details:** `onVolumeChange` in `Slider.tsx` leaks a specific use case ("volume") into the generic slider API. Rename to `onValueChange` or `onChange`. This requires updating `SliderProps`, the `Slider` component body, and all call sites that pass this prop. The callback also performs vertical inversion (`max - (emitValue - min)`) and rounds to integer — both domain-specific behaviours that may need to be extracted if generalising.

> **Carried from 2026-04-05 → 2026-04-07 → 2026-04-09 (//TODO //HELP):** "This is a bit tricky since the callback is currently volume-specific but the slider component is generic. Need to understand and build up a system from custom reactions." — Needs design decision on how custom reaction callbacks should work before renaming.

### Add `reset()` / `clearAll()` to `interpreter` for testability
**Category:** Testability
**Impact:** Medium
**Effort:** Low
**Details:** `interpreter.ts` has module-level mutable state in the `gestures` object. The only cleanup API is `deleteGesture(pointerId)` — there is no way to reset all state between tests. Export a `resetGestures()` function (or `__test__reset()` gated behind a flag) that clears the map (and the gesture counter, if the performance ticket above is applied). This prevents cross-test contamination.

> **Carried from 2026-04-09 (//SKIPPED):** Developer noted "You don't have tests yet and when you do you can just add it then. Don't build test infrastructure for tests that don't exist." Valid reasoning — this becomes actionable only when test authoring begins.

---

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

### Rename `Reactions` to `Capabilities` or `InteractionFlags`
**Category:** Naming
**Impact:** Medium
**Effort:** Low
**Details:** The `Reactions` interface in `baseType.ts` describes what an element *can do* (`pressable`, `swipeable`, `modifiable`). "Reactions" reads as something the element produces, not what it supports. Rename to `Capabilities` or `InteractionFlags` in `baseType.ts` and update all references in `buildDesc.ts`, `descriptor.ts`, and `gestureUtils.ts`.

### Disambiguate "context" naming across the system
**Category:** Naming
**Impact:** Medium
**Effort:** Medium
**Details:** Three distinct concepts share "context": `CtxType`/`CtxCarousel`/etc. (pipeline payloads), `DomContext` (parsed DOM metadata), and `buildContext` (builds a `DomContext`). Consider renaming `DomContext` → `DomInfo` or `ElementMeta`, and `buildContext` → `buildDomInfo`/`buildElementMeta`, to separate it from the `Ctx*` pipeline payload namespace. The `Ctx*` types are well-established and widely used — renaming those would be higher churn.

### Move `GestureUpdate` to slider-specific types
**Category:** Dead Code / Naming
**Impact:** Low
**Effort:** Low
**Details:** `GestureUpdate` in `dataType.ts` has fields `sliderStartOffset` and `sliderValuePerPixel` — it is slider-specific. It is only constructed by `sliderSolver`, applied by `interpreter.applyGestureUpdate` (gated on `desc.type === 'slider'`), and consumed by `sliderUtils.resolveSwipe`. Move it out of shared `dataType.ts` into a slider-specific location (e.g., `sliderSolver.ts` or a new `sliderTypes.ts`) or rename it to `SliderGestureUpdate`.

### Extract shared normalize pattern from `carouselUtils` and `sliderUtils`
**Category:** Dead Code / Consistency
**Impact:** Low
**Effort:** Low
**Details:** `carouselUtils.normalize` and `sliderUtils.normalize` share identical structure: call `normalizeBase(desc.base, desc.ctx.delta)`, then add `mainSize`/`crossSize` from their respective size data. This could be extracted into a shared helper in `axisUtils.ts` that accepts a `size: Vec2` parameter, reducing duplication and enforcing consistency.

### Remove or standardize `BASE_STYLE` with `willChange` in slider motion
**Category:** Consistency
**Impact:** Low
**Effort:** Low
**Details:** `useSliderMotion` defines `BASE_STYLE = { willChange: "transform" }` and spreads it into every thumb style. `useCarouselMotion` and `useDragMotion` do not use `willChange`. Either add `willChange: "transform"` to all three motion hooks for consistency, or remove it from slider — modern browsers auto-detect `willChange` for elements with `transform` animations.

### Split `gestureUtils` into focused modules
**Category:** Separation of Concerns
**Impact:** Low
**Effort:** Medium
**Details:** `gestureUtils` mixes normalization (`normalizedDelta`), axis resolution (`resolveAxis`), threshold detection (`swipeThresholdCalc`), and a type guard (`isSwipeableDescriptor`). These serve different concerns — math, config, and type narrowing. Consider splitting into `normalizeUtils` (or inlining into `axisUtils`), keeping threshold in `gestureUtils`, and moving `isSwipeableDescriptor` to `descriptor.ts` or a dedicated type guard file.

### Document `data-*` attribute contract
**Category:** Naming / Scalability
**Impact:** Low
**Effort:** Low
**Details:** The system relies on `data-type`, `data-id`, `data-axis`, `data-press`, `data-react-press`, `data-swipe`, `data-react-swipe`, `data-locked`, `data-snap-x`, `data-snap-y`, `data-lock-prev-at`, `data-lock-next-at`, `data-swiping`, `data-pressed`, `data-action`, and more. These are the system's public API surface between React components and the interaction engine. There is no single reference for which attributes exist, what they do, and which are required vs optional. A brief contract document (or a TypeScript interface with JSDoc) would improve discoverability for new developers and reduce the risk of typos.

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
