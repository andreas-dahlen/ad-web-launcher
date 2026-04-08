# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

### Fix store `.get()` return types
**Category:** Type Safety
**Impact:** High
**Effort:** Low
**Details:** `carouselStore.get()` and `sliderStore.get()` are typed as returning `Readonly<Carousel>` and `Readonly<Slider>` respectively, but both actually return `null` via `?? null`. Add `| null` to their return type signatures to match `dragStore.get()` which already declares it. This affects `carouselStore.ts` and `sliderStore.ts`.

### Add `event` to `CarouselCtxPartial`
**Category:** Type Safety
**Impact:** High
**Effort:** Low
**Details:** `carouselSolver.swipeCommit()` returns `{ event: 'swipeRevert', storeAccepted: true }` but `CarouselCtxPartial` in `ctxType.ts` is `Partial<Pick<CtxCarousel, 'delta1D' | 'direction' | 'storeAccepted'>>` — it does not include `event`. The field passes through via spread in `pipeline.ts` only because TypeScript allows extra properties on spreads. Add `'event'` to the Pick union in `CarouselCtxPartial` so this contract is explicit and type-checked.

### Remove dead `Slider.offset` state
**Category:** Dead Code
**Impact:** Medium
**Effort:** Low
**Details:** In `sliderStore.ts`, the `offset: number` field on the `Slider` type is initialized to `0` but never mutated by any store method (`press`, `swipeStart`, `swipe`, `swipeCommit` all update `value`). Remove it from the `Slider` type, the `init()` default, and the `DEFAULTS` object in `useSliderStore.ts`. This also eliminates one field from every shallow-compare cycle.

### Remove dead type guard and impossible branch in vectorUtils
**Category:** Dead Code
**Impact:** Medium
**Effort:** Low
**Details:** In `vectorUtils.ts`, `vector.resolveDirection()` has `typeof delta !== "object"` — `delta` is typed `number`, so this is always true. Remove the guard. Also, `vector.resolveByAxis1D()` has `if (!value)` where `value` is `Vec2` (always truthy) — returning `{ prim: undefined, sub: undefined }` on an impossible path. Remove that guard.

### Make `Slider.dragging` required
**Category:** Consistency
**Impact:** Medium
**Effort:** Low
**Details:** In `sliderStore.ts`, `dragging` is typed as `dragging?: boolean` (optional) while `Carousel` and `Drag` declare it as required `boolean`. This forces `dragging ?? false` in `Slider.tsx`. Change it to `dragging: boolean` and set its default to `false` in `init()` (which it already is implicitly).

### Add equality check to `sliderStore.setSize()` and `setThumbSize()`
**Category:** Performance
**Impact:** Medium
**Effort:** Low
**Details:** `carouselStore.setSize()` already checks `if (s.size.x === trackSize.x && s.size.y === trackSize.y) return` to avoid unnecessary re-renders. `sliderStore.setSize()` and `sliderStore.setThumbSize()` lack this check, meaning every ResizeObserver callback triggers a store update unconditionally. Add the same equality guard to both methods in `sliderStore.ts`.

### Remove unused `Axis1D` type
**Category:** Dead Code
**Impact:** Low
**Effort:** Low
**Details:** `Axis1D` is defined in `primitiveType.ts` as `'horizontal' | 'vertical'` but the codebase universally uses `Exclude<Axis, 'both'>` to express the same constraint. Either delete `Axis1D` or replace all `Exclude<Axis, 'both'>` occurrences with `Axis1D` — one or the other, not both.

### Remove unused `Builder` export and `CtxSwipeType`
**Category:** Dead Code
**Impact:** Low
**Effort:** Low
**Details:** The `Builder` interface is exported from `buildDesc.ts` but only used internally within that file — remove the `export` keyword. `CtxSwipeType` in `ctxType.ts` is defined as `Exclude<CtxType, CtxButton>` but does not appear to be referenced outside the type file. If confirmed unused, remove it.

### Clean up stale comments
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** Remove `//intentUtils.js` at line 8 of `gestureUtils.ts` (leftover from a rename). Address or remove `//future me -> probably return pressCancel...` TODO in `interpreter.ts`. Remove `//carousel only` comment above `vector.resolveDirection()` in `vectorUtils.ts` — this documents a usage constraint that should be enforced by types, not comments.

---

## High Priority
*High impact, higher effort or risk — plan these carefully*

### Type-safe solver-to-pipeline event routing
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** In `pipeline.ts`, `ctx.event as keyof CarouselFunctions` (and equivalent for Slider/Drag) is an unsafe cast. If `event` is `'press'` or `'pressRelease'`, these keys don't exist on `CarouselFunctions`. The optional chaining `fn?.(ctx)` prevents runtime crashes but silently swallows invalid states. Replace the cast with a validated lookup — e.g., check `event in storeFunctions` before calling, or narrow the `EventType` to the specific subset each primitive accepts using the existing `EventMap` type from `pipelineType.ts`.

### Handle `pointercancel` as abort, not commit
**Category:** Error Handling
**Impact:** High
**Effort:** Medium
**Details:** In `pointerBridge.ts`, `pointercancel` shares the same handler as `pointerup`. This means a browser-cancelled gesture (e.g., system dialog, touch interruption) goes through `interpreter.onUp()` and can trigger `swipeCommit`. Either map `pointercancel` to `pipeline.abortGesture()` directly, or introduce a distinct `'cancel'` event in `EventBridgeType` that the interpreter handles by reverting/cleaning up.

### Replace gesture map overflow wipe with targeted eviction
**Category:** Error Handling
**Impact:** High
**Effort:** Medium
**Details:** `interpreter.onDown()` clears ALL entries in the `gestures` map when it exceeds 10 entries. This kills active, in-progress gestures for other pointers. Replace the blanket wipe with targeted eviction — e.g., delete the oldest gesture, or gestures that have been in PENDING state longest.

### Simplify `Normalized1D` double-optionality
**Category:** Type Safety
**Impact:** Medium
**Effort:** Medium
**Details:** Every field on `Normalized1D` in `ctxType.ts` is typed as both optional (`?`) and `number | null`, creating redundant double-optionality that makes null-checks verbose throughout `carouselUtils.ts`, `sliderUtils.ts`, and `utilsShared.ts`. Pick one convention: either `field?: number` (use `undefined` for absent) or `field: number | null` (always present but nullable). Apply consistently and update all consumer null-checks.

### Rename `onVolumeChange` to generic callback name
**Category:** Naming
**Impact:** Medium
**Effort:** Medium
**Details:** `onVolumeChange` in `Slider.tsx` leaks a specific use case ("volume") into the generic slider API. Rename to `onValueChange` or `onChange`. This requires updating `SliderProps`, the `Slider` component body, and all call sites that pass this prop. Note: the callback also performs vertical inversion (`max - (emitValue - min)`) and rounds to integer — both domain-specific behaviours that may need to be extracted if generalising.

> **Carried from 2026-04-05 → 2026-04-07 (//TODO //HELP):** "This is a bit tricky since the callback is currently volume-specific but the slider component is generic. Need to understand and build up a system from custom reactions." — Needs design decision on how custom reaction callbacks should work before renaming.

### Rename ambiguous `utils` export in gestureUtils
**Category:** Naming
**Impact:** Medium
**Effort:** Medium
**Details:** `gestureUtils.ts` exports `const utils = {...}`. In a codebase with `carouselUtils`, `dragUtils`, `sliderUtils`, `utilsShared`, and `vectorUtils`, importing a bare `utils` is ambiguous. Rename to `gestureUtils` (matching the file name) and update all import sites in `domQuery.ts`, `interpreter.ts`, and any other consumers.

### Standardise `readonly` on `SliderData.constraints`
**Category:** Type Safety / Consistency
**Impact:** Medium
**Effort:** Low
**Details:** `SliderData.constraints` in `dataType.ts` has non-readonly fields (`{ min: number; max: number }`) while `DragData.constraints` uses `readonly` on all its fields. Add `readonly` to `SliderData.constraints` for a consistent immutability contract across data types.

### Add interpreter reset capability for testability
**Category:** Testability
**Impact:** Medium
**Effort:** Medium
**Details:** The `gestures` map in `interpreter.ts` is a module-level variable with no exported `reset()` or `clear()` function. Tests cannot reliably isolate gesture state between test cases without reloading the entire module. Export a `resetGestures()` function (or `__test__reset()` gated behind a flag) that clears the map.

---

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

### Rename `prim`/`sub` to `main`/`cross` in vectorUtils
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `vector.resolveByAxis1D()` in `vectorUtils.ts` returns `{ prim, sub }`. These abbreviations require domain knowledge — "prim" means primary axis, "sub" means cross axis. The rest of the system already uses `main`/`cross` naming (e.g., `mainDelta`, `crossDelta` in `Normalized1D`). Rename for consistency to `{ main, cross }` and update all destructuring sites in `carouselUtils.ts`, `sliderUtils.ts`, and `utilsShared.ts`.

### Rename `delta1D` to a self-documenting name
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `delta1D` on `CtxCarousel` and `CtxSlider` in `ctxType.ts` is not self-documenting. It represents the axis-decomposed movement magnitude. Consider `axisDelta` or `primaryDelta` to match the `main`/`cross` vocabulary used elsewhere in the system.

### Rename `utilsShared.ts` to reflect actual contents
**Category:** Naming
**Impact:** Low
**Effort:** Low
**Details:** `utilsShared.ts` is a generic name. It contains exactly two functions: `normalizeBase()` and `exceedsCrossRange()`. Rename to `normalization.ts` or `axisNormalization.ts` to reflect its actual responsibilities. Update import paths in `carouselUtils.ts`, `sliderUtils.ts`, `carouselSolver.ts`, and `sliderSolver.ts`.

### Disambiguate `Context` vs `Ctx` naming
**Category:** Naming
**Impact:** Low
**Effort:** Medium
**Details:** `buildContext()` returns a `Context` type (raw DOM attribute extraction in `baseType.ts`) while all other "ctx" references (`CtxType`, `CtxCarousel`, `.ctx` on descriptors) refer to the mutable solver/pipeline context. Two different concepts share the same naming root. Consider renaming `Context` to `ElementContext` or `DOMContext` to distinguish it from the pipeline context types.

### Unify constraint representation across stores
**Category:** Consistency
**Impact:** Low
**Effort:** Medium
**Details:** `dragStore` stores constraints as flat fields (`minX`, `maxX`, `minY`, `maxY`). `sliderStore` nests them (`{ min, max }`). `carouselStore` doesn't store constraints at all — they come from DOM `data-*` attributes. While each has functional reasons, the three different patterns make the system harder to learn. Consider a shared constraint convention — at minimum, align Drag and Slider to use the same structure.

### Unify offset naming across stores
**Category:** Consistency
**Impact:** Low
**Effort:** Medium
**Details:** Carousel uses `offset` (1D number representing live swipe displacement). Drag uses `offset` (Vec2 representing live drag displacement). Slider had `offset` (unused — to be removed per quick win above) and uses `value` for the committed position. The same conceptual field — "live displacement during gesture" — has different types and names. Consider aligning on a single naming convention, e.g., `liveOffset` (1D or 2D as appropriate) for the transient drag value.

### Extract shared `useResizeObserver` hook
**Category:** Dead Code / Scalability
**Impact:** Low
**Effort:** Medium
**Details:** `useCarouselSizing`, `useDragSizing`, and `useSliderSizing` all follow the same pattern: create ResizeObserver → observe element(s) → measure dimensions → call store setter → disconnect on cleanup. Extract a shared `useResizeObserver(refs, callback)` hook to reduce duplication and provide a single place to add debouncing or observer pooling in the future.

### Type callback props with `CtxType` instead of `unknown`
**Category:** Type Safety
**Impact:** Low
**Effort:** Low
**Details:** `onPress`, `onPressRelease`, `onPressCancel` in `Button.tsx` and `onSwipeCommit` in `Carousel.tsx` and `Drag.tsx` are typed as `(detail: unknown) => void`. Consumers must cast to get useful type information. Type these as `(detail: CtxType) => void` or the appropriate narrowed context type (e.g., `CtxButton` for button callbacks).

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
