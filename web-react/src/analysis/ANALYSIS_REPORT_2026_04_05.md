# Analysis Report — Interaction & Components System

## Overview

The system demonstrates a well-conceived architecture — a clean unidirectional pipeline from pointer events through interpretation, solving, state mutation, and rendering, with React components operating as a purely declarative view layer over Zustand stores. The solver pattern (pure functions in, partial context out) and the separation of motion/sizing/state hooks per primitive are genuinely strong design choices. However, the implementation has accumulated practical debt: type safety erodes at key boundaries (solver inputs, DOM casts, partial contexts), the helper files (`intentUtils`, `solverUtils`) absorb too many responsibilities, a circular dependency exists in the core, store subscriptions are coarser than needed, gesture lifecycle edge cases (unmount, assertion failures in production) can cause silent failures, and adding a new primitive requires coordinated changes across 12+ files with no automation. The bones are sound, but the system needs tightening at its seams — particularly around type boundaries, concern separation in the utility layers, and robustness of the gesture lifecycle.

## Overall Score: 5.5/10

---

## Findings

### 1. Type Safety — 5/10

`CtxPartial` is structurally permissive. Defined as `Partial<Exclude<CtxSwipeType, CtxButton>>` in `pipelineType.ts`, it dissolves the discriminated union into a flat partial. A carousel solver can legally return `{ gestureUpdate: ... }` (a slider-only field) with no compiler complaint. The pipeline merges solver output with a spread (`{ ...ctx, ...sr }`) in `pipeline.ts`, so the wrong fields silently land on the wrong ctx type.

Solver function signatures accept the full `Descriptor` union. Each solver narrows internally via assertion type guards (`isCarousel(desc)`), but the call site in `pipeline.orchestrate` gives every solver the full union. Static type safety depends entirely on runtime assertions that, in production mode (when `VITE_DEBUG !== 'true'`), only `console.warn` and then continue execution with the un-narrowed type.

Unsafe casts from DOM data attributes exist in `intentUtils.ts`. `ds.axis as Axis` and `ds.type as InteractionType` cast raw `string | undefined` values without validation. A typo in a `data-type` attribute silently produces an invalid `InteractionType`.

Non-null assertions on store reads are present in `buildDesc.ts`. Calls like `carouselStore.getState().get(ctx.id)!` (and equivalent for slider/drag) will crash at runtime if the component hasn't mounted yet or the ID is wrong.

Inconsistent function casing exists in `pipelineType.ts`: `solverFn` (lowercase) vs `SolverMap` (uppercase) for related concepts.

The index signature `[key: string]: unknown` on `ButtonProps` in `Button.tsx` disables excess property checking for all Button consumers.

`GestureState.type` in `interpreter.ts` is typed as `string`, not `InteractionType`, despite storing an interaction type value.

### 2. State Management — 6/10

Side effects occur during render. All three `use*Zustand` hooks (`useCarouselZustand`, `useDragZustand`, `useSliderZustand`) call `store.getState().init(id)` at the top level during render. This is a Zustand `set()` call inside a React render path — it works because `init` guards against duplicate initialization, but it violates React's expectation that render is pure.

Subscription granularity is coarse. Each `use*Zustand` hook subscribes to the entire state slice for that `id`. During a carousel drag, `offset` changes on every pointer move, which is expected to re-render. But `settling` and `pendingDir` transitions also trigger re-renders in the component even though the component only reads `offset` and `dragging` for motion calculations. No `useShallow` or field-level selectors are used (except in `sizeState`).

`requestAnimationFrame` lives inside a store action. `carouselState.ts` `setPosition` schedules a `requestAnimationFrame` to reset `settling`. This mixes async orchestration into state. If the component unmounts between the rAF scheduling and execution, the callback writes to a store entry for a potentially stale `id`.

No store cleanup on unmount. Store entries (`carouselStore[id]`, `dragStore[id]`, `sliderStore[id]`) persist indefinitely. For a launcher app this is likely fine, but dynamically created/destroyed primitives would leak entries.

The dual-access pattern is well-structured. Imperative reads via `getState()` (in `buildDesc`, `pipeline`) and reactive reads via hooks in components. The stores serve both well. Cross-store dependencies are minimal — stores don't reference each other, only `pipeline` and `buildDesc` coordinate across them.

### 3. Separation of Concerns — 6/10

A circular dependency chain exists: `intentUtils` → `domQuery` → `buildDesc` → `intentUtils`. Specifically: `intentUtils.resolveTarget()` calls `domQuery.findTargetInDom()`, which calls `buildDesc.resolveFromElement()`, which calls `intentUtils.buildContext()`. This works at runtime due to JS module evaluation order, but makes the dependency graph hard to reason about and refactor.

`intentUtils.ts` is a responsibility grab-bag. It handles context building from DOM elements, axis resolution, swipe threshold calculation, target resolution, swipe-start resolution with lane fallback, cancel resolution, and delta normalization. These span DOM querying, geometry, and gesture policy.

`solverUtils.ts` bundles all three primitive-specific solver logics. Carousel commit thresholds, slider value-per-pixel mapping, and drag snap calculations all live in one 170-line file. Each solver imports this shared file but uses only its own subset of functions.

The bridge is a React hook inside `interaction/`. `bridge.ts` (`usePointerForwarding`) is a React hook with `useEffect`, `useRef`, and DOM event listeners. It's the only React-dependent file in the otherwise framework-agnostic `interaction/` directory. This breaks the clean separation where `interaction/` could theoretically be used outside React.

Pipeline, interpreter, solvers, stores, and renderer are otherwise well-bounded. Each has a clear single-direction data flow.

### 4. Naming & Discoverability — 5/10

The `zunstand/` directory name is non-obvious. Likely intentional (avoids collision with the package name), but a new developer would search for "zustand" and not find it. No README or comment explains the naming.

Three different things are called "context." `Context` in `baseType.ts` (DOM element metadata), `CtxType`/`CtxCarousel`/etc. in `ctxType.ts` (pipeline event context), and React component contexts. A developer searching for "context" gets noise.

`Reactions` vs `react*` data attributes create confusion. `Reactions` in `baseType.ts` is `{ pressable, swipeable, modifiable }`. Meanwhile, `data-react-press`, `data-react-swipe` are DOM attributes. The "react" prefix on data attributes reads as React-framework-related, not "reaction-related."

The `updater/` directory contains `renderer.ts`. The directory name and file name convey different metaphors. A developer looking for "rendering" wouldn't check `updater/`.

"Lane" terminology is component-only. Components use `laneSize`, `laneState`, `lanePosition` extensively, but `interaction/` never uses this term. The two halves of the system speak different vocabularies for the same concepts.

`bridge.ts` exports `usePointerForwarding`. The file name suggests a bridge pattern but the export name says pointer forwarding. The two terms aren't connected to a developer without system knowledge.

`InteractiveProps` type in `Interactive.tsx` has no export. If a parent component wants to type a prop as `InteractiveProps`, it can't import it.

### 5. Consistency Across Primitives — 6/10

Naming drift exists for analogous state fields. Carousel uses `index`, Slider uses `value`, and Drag uses `position` for their canonical "current value." For live drag delta, Carousel and Drag use `offset`, but Slider updates `value` directly on every swipe event. The constraint concept is `lockSwipeAt` for Carousel, `min`/`max` for Slider, and `minX`/`maxX`/`minY`/`maxY` for Drag.

Slider updates its value directly on every swipe event; Carousel and Drag maintain a separate `offset` during drag and commit on release. This is a fundamental behavioral asymmetry — Slider has no revert concept.

Callback naming is inconsistent. Carousel and Drag expose `onSwipeCommit`. Slider exposes `onVolumeChange` — a domain-specific name rather than a generic gesture callback. A developer building a slider for something other than volume would find this misleading.

Drag gates `onSwipeCommit` behind a `reactSwipeCommit` boolean prop. Carousel fires `onSwipeCommit` unconditionally if the prop is provided. Different patterns for the same concept.

Slider has a unique `press` event. Neither Carousel nor Drag handle `press` in their solver. Slider does — it resolves value on press (tap-to-position). This is justified behavior but means the solver interface shape differs.

Slider has a `gestureUpdate` feedback loop. Its solver returns `gestureUpdate` which the pipeline feeds back into the interpreter via `applyGestureUpdate`. No other primitive uses this. The pipeline has a slider-specific `if` branch for this at `pipeline.ts`.

Sizing hooks differ in signature. `useCarouselSizing({ elRef, axis, id })`, `useSliderSizing({ elRef, thumbRef, id })`, `useDragSizing({ elRef, containerRef, id })`. This makes sense given different DOM structures, but there's no shared base pattern.

### 6. Error Handling & Edge Cases — 4/10

Gesture leak on non-pressable pointerdown. In `interpreter.ts`, `onDown` always creates a `gestures[pointerId]` entry. If the element isn't pressable, it returns `null` but the gesture entry persists. If the user lifts without moving past the swipe threshold, `onUp` fires with `g.phase === 'PENDING'` and triggers `pressRelease` for a non-pressable element. The pipeline then calls `render.handle(ctx)` which dispatches a spurious `pressRelease` CustomEvent to the element.

Unmounted element references are possible. If a component unmounts mid-gesture, `usePointerForwarding` cleans up listeners but calls `pipeline.abortGesture` only if `disabled` changes to `true`. A normal unmount (no `disabled` toggle) runs the listener cleanup but the interpreter still holds a `GestureState` with a reference to the detached DOM element. If the pointer somehow fires `onUp` afterward, the pipeline writes data attributes and dispatches events to a detached element — silent no-op at best, error at worst.

Assertion type guards degrade to warnings in production. In `gestureTypeGuards.ts`, when `VITE_DEBUG !== 'true'`, a type mismatch only `console.warn`s and execution continues. The assertion still narrows the type for TypeScript, so subsequent code treats the value as the asserted type even though the runtime check failed.

No validation of `data-id` uniqueness. If two components share the same `id`, they silently share stores and produce unpredictable behavior.

No guard against concurrent pointer issues at the pipeline level. While `usePointerForwarding` blocks multi-pointer per element, nothing prevents two different elements from having concurrent gestures whose solvers interleave. The interpreter handles this fine (gestures keyed by `pointerId`), but stores receive updates without any ordering guarantees.

`findTargetInDom` swallows elements that aren't `HTMLElement`. If an SVG element is in the hit stack, it's silently skipped — fine, but undocumented behavior that could surprise developers adding SVG-based interactives.

### 7. Performance — 7/10

ResizeObservers are not pooled. Each primitive instance creates its own observer (Slider creates one observing two elements). For a launcher with ~10–20 primitives this is fine. At scale (50+), the observer count grows linearly with no sharing.

No throttling on ResizeObserver callbacks. A rapid series of layout changes triggers synchronous Zustand `set()` calls per observation. ResizeObserver batches natively, but animated resizes could produce multiple callbacks.

Immer overhead exists per pointer move. Each `swipe` event triggers `pipeline.orchestrate` → store `set()` → immer proxy creation + structural sharing. At 60fps pointer input (16ms budget), this means ~60 immer patches/second during drag. Immer's overhead is low (~0.1ms per simple patch), but it's not zero.

`document.elementsFromPoint` runs on every pointerdown. This is O(DOM depth) and triggers style/layout recalc if dirty. For a launcher with moderate DOM depth, this is fine.

Store entry persistence. Entries are never removed. For a launcher that doesn't dynamically create/destroy many primitives, this is a non-issue. For a dynamic list, it's a slow leak.

`normalizeParameter` indirection. Called on every delta update via `utils.normalizedDelta`, which calls `sizeStore.getState().normalizeParameter(...)`. Two function calls + one `getState()` per axis per event. Negligible but could be a direct division.

The Zustand re-render path is well-designed. Component re-renders on every `swipe` event to update CSS transforms. The motion hooks compute `transform` strings in `useMemo` gated on the changing values. The re-render → useMemo → new style object → React reconciliation → DOM update path is efficient for transform-only changes.

### 8. Testability — 6/10

Solvers are highly testable (9/10). Pure functions `(Descriptor) → CtxPartial`. Only dependencies are `solverUtils`, `vectorUtils`, and type guards. Can be tested with fabricated descriptors.

`vectorUtils` is perfectly testable (10/10). Pure math, no dependencies.

`solverUtils` is testable but coupled to config (8/10). Imports `APP_SETTINGS` for thresholds. Testable if you accept the config as fixed, or mock the import.

`interpreter.ts` is testable but stateful (5/10). Module-level `gestures` map means tests must manage state between calls. No way to reset state without calling `deleteGesture` for each `pointerId`. Would benefit from dependency injection or a factory.

`pipeline.ts` is an integration point, hard to unit test (3/10). Depends on the interpreter, all solvers, all stores, and the renderer. Would require mocking 6+ modules.

`bridge.ts` / `usePointerForwarding` requires React + DOM (4/10). Standard hook testing with `renderHook`, but also requires pointer event simulation and pipeline mocking.

`domQuery.ts` and `buildDesc.ts` require DOM + stores (3/10). `document.elementsFromPoint`, `dataset`, `getBoundingClientRect`, plus reading from three Zustand stores. Heavy mock surface.

`renderer.ts` requires DOM (6/10). Simple enough to test with jsdom.

### 9. Dead or Redundant Code — 5/10

`useCarouselScenes.ts` hook is unused. `Carousel.tsx` does its own scene slotting inline. Only the `SceneRole` type export is consumed.

Pervasive commented-out code exists throughout. Examples include: `sizeState.ts` (commented `init`), `intentUtils.ts` (commented exports), `gestureTypeGuards.ts` (~20 lines of commented alternative implementations), `dragSolver.ts` (commented imports), `useDragSizing.ts` (commented `useState` lines), `useCarouselSizing.ts` (commented state).

`GestureState.type` field is written but never read. In `interpreter.ts`, `type` is set from `resolved.type` but no code ever accesses `g.type`.

`intentUtils.resolveTarget` is a trivial wrapper. It calls `domQuery.findTargetInDom(x, y, pointerId)` and returns its result or `null` — but `findTargetInDom` already returns `null`. The wrapper adds nothing.

Redundant spread in `Interactive.tsx`. `const { ...rest } = props` followed by `<Button {...rest} />` in every case — the destructure is a no-op clone.

`Descriptor` duplicates `type` at two levels. The descriptor has a top-level `type: 'carousel'` and `ctx.type: 'carousel'`. Both are always the same value. The duplication creates a synchronization invariant that must be maintained manually.

`buildBase` adds `actionId` for all types, but it's only meaningful for buttons (via `data-action`). Carousel, Slider, and Drag descriptors carry an unused `actionId` field.

### 10. Scalability — 5/10

Adding a 4th primitive requires touching ~12+ files. The checklist: new entry in `InteractionType` union, new `Ctx*` type, new `*Data` type, new `*Desc` type, new solver, new store, new `build*` methods in `buildDesc`, new case in `buildDesc.resolveFromElement`, new entry in `solverRegistry`, new case in `pipeline.orchestrate` switch, new `EventMap` entry and `*Functions` type, new component + hooks, new case in `Interactive.tsx`. No registration or plugin pattern exists to automate this.

`solverUtils.ts` is already a scaling bottleneck. It contains type-specific logic for all three primitives in one file. A 4th primitive would add another block and increase merge conflict surface.

`pipeline.orchestrate` switch statement grows linearly. Each new type adds a case with the same store-dispatch boilerplate. This is a candidate for a registry or strategy pattern.

`pipelineType.ts` manually enumerates store function types. `CarouselFunctions`, `SliderFunctions`, `DragFunctions` are explicitly defined. A new primitive needs a new `*Functions` type and corresponding `EventMap` entry.

DOM-based communication (data attributes) doesn't compose deeply. Nested interactives (e.g., a drag inside a carousel) depend on `document.elementsFromPoint` ordering and the `findLaneInDom` fallback. Adding more primitives increases the chance of ambiguous hit resolution.

Team scalability is limited. `intentUtils.ts`, `solverUtils.ts`, and `pipeline.ts` are high-traffic files that multiple developers would edit for different primitives. No modular boundaries exist to reduce conflicts.
