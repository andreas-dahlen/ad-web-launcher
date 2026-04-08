# Analysis Report — Interaction & Components System

## Overview

The interaction + components system is a well-conceived, cleanly layered gesture engine. Its discriminated-union-driven type narrowing, Zustand store isolation, and pure solver design demonstrate strong architectural thinking. The pipeline flow (bridge → interpreter → solver → store → updater) provides clear data flow with good separation at each boundary. The weakest areas are naming inconsistency (making the system harder to learn than it needs to be), silent failure modes in error handling, and scalability friction from the absence of a registration pattern for new primitives. The type system is good but has specific holes around solver partial types and store return types that could allow subtle bugs. Performance is adequate but immer on high-frequency events is a latent bottleneck. Overall, this is a healthy system that would benefit most from tightening types, standardizing naming, and extracting shared patterns across the three primitives.

## Overall Score: 7/10

---

## Findings

### 1. Type Safety — 7/10

The type system is generally solid. Discriminated unions (`Descriptor`, `CtxType`) provide good narrowing through the pipeline and solvers. `toAxis()` / `toType()` in `primitiveType.ts` provide runtime validation at the DOM boundary. No `any` usage was found anywhere in the codebase.

**Solver partial types allow undeclared fields through spread.** In `pipeline.ts`, `ctx = { ...ctx, ...sr }` spreads solver results into context. `carouselSolver.swipeCommit()` returns `{ event: 'swipeRevert', storeAccepted: true }` — the `event` field is not part of `CarouselCtxPartial` (defined in `ctxType.ts` as `Partial<Pick<CtxCarousel, 'delta1D' | 'direction' | 'storeAccepted'>>`). TypeScript allows extra properties through spread, so this works at runtime but bypasses the type contract.

**Unsafe cast `ctx.event as keyof CarouselFunctions`** in `pipeline.ts`. If `event` is `'press'` or `'pressRelease'`, these keys don't exist on `CarouselFunctions`. The optional chaining `fn?.(ctx)` prevents a runtime crash, but the cast silently swallows invalid states.

**Store `.get()` return types are incorrect.** `carouselStore.get()` is typed as returning `Readonly<Carousel>` but actually returns `null` via `?? null`. Same for `sliderStore.get()`. `dragStore.get()` at least declares `| null` in its signature.

**`Normalized1D` uses redundant double-optionality.** Every field is typed `number | null` and also optional (`?`), making null-checks unnecessarily verbose throughout solver utils.

**`SliderData.constraints`** in `dataType.ts` has non-readonly fields (`{ min: number; max: number }`) while `DragData.constraints` uses `readonly` on all fields. Inconsistent immutability contract.

**Callback props typed as `unknown`.** `onPress`, `onPressRelease`, `onPressCancel` in `Button.tsx` and `onSwipeCommit` in `Carousel.tsx` and `Drag.tsx` use `(detail: unknown) => void`. Consumers must cast to get any useful type information.

**`Slider.dragging` is optional (`dragging?: boolean`)** in the `Slider` type inside `sliderStore.ts` while `Carousel` and `Drag` declare it as required `boolean`. This forces a `dragging ?? false` fallback in `Slider.tsx`.

**`typeof delta !== "object"` guard** in `vector.resolveDirection()` in `vectorUtils.ts` — `delta` is typed as `number`, so this condition is always true. This is a dead type guard that adds confusion.

### 2. State Management — 8/10

Store architecture is clean. Each primitive has its own Zustand store with id-keyed `bindings` maps — `carouselStore`, `dragStore`, `sliderStore` — plus a cross-cutting `sizeStore`. Zustand with `useShallow` in the `use[X]Store` hooks prevents unnecessary re-renders. The pattern of per-id init/delete lifecycle in the store hooks is consistent and correct.

**`requestAnimationFrame` inside `carouselStore.setPosition()`.** Invoking `set()` inside a rAF callback from within a store method creates a side-effect inside what should be a pure state transition. If the binding is deleted before the rAF fires, the `if (!s) return` guard handles it, but this is an unusual pattern for Zustand stores.

**Immer on every swipe frame.** All stores use `immer` middleware. During continuous drag/swipe at 60fps, every `pointermove` triggers `immer(produce(...))` in the active store (e.g., `dragStore.swipe()`, `carouselStore.swipe()`). Immer's structural sharing overhead is non-trivial at this frequency.

**Subscription granularity is coarse.** Each `use[X]Store` hook returns the entire binding object for a given id via `useShallow(s => s.bindings[id] ?? DEFAULTS)`. Any field change in the binding triggers a shallow comparison of all fields. For carousel, this includes `settling` and `pendingDir` which are non-reactive pipeline-internal state mixed with rendering state.

**Flat vs nested constraint representation.** `dragStore` stores constraints as flat fields (`minX`, `maxX`, `minY`, `maxY`) while `sliderStore` nests them (`{ min, max }`). `carouselStore` doesn't store constraints at all — they come from DOM `data-*` attributes. Three different patterns for the same concept.

**`Slider.offset` is dead state.** In `sliderStore.ts`, `offset: number` is initialized to `0` but never mutated by any store method (`press`, `swipeStart`, `swipe`, `swipeCommit` all update `value`, not `offset`). It exists in the binding shape and is subscribed to in `useSliderStore` but serves no purpose.

### 3. Separation of Concerns — 7/10

The overall layered architecture (bridge → pipeline → interpreter → solvers → stores → updater) provides good separation. Solvers are pure decision engines. The updater handles only DOM mutations. Types are cleanly organized in their own directory.

**`buildDesc.ts` directly reads from all three stores.** It imports `carouselStore`, `dragStore`, and `sliderStore` and calls `.getState().get(id)` in `buildCarouselData()`, `buildSliderData()`, and `buildDragData()`. The descriptor factory layer has direct knowledge of the state management layer, making it untestable without store stubs.

**`interpreter.ts` performs DOM queries.** The gesture state machine calls `domQuery.findLaneInDom()` during the PENDING→SWIPING transition. This mixes state machine logic with DOM resolution. The interpreter should ideally receive already-resolved targets.

**`gestureUtils.ts` imports from `sizeStore`.** The "utility" module imports `normalizeParameter` and `getAxisSize` from `sizeStore.ts`. Utility functions with store dependencies are harder to test and reason about.

**Pipeline is correctly the orchestrator.** `pipeline.orchestrate()` coordinates interpreter → solver → store → updater. This is a legitimate single responsibility (orchestration), and the switch/case structure keeps each type's wiring co-located.

**domUpdater is cleanly scoped.** `domUpdater.ts` handles only DOM attribute writing and event dispatch. The `handleExtras()` function for press cancellation is a well-contained concern within it.

### 4. Naming & Discoverability — 6/10

The system's naming is functional but inconsistent. A developer new to the codebase would struggle with several abbreviations and overloaded names.

**`utils` as export name.** `gestureUtils.ts` exports `const utils = {...}`. Importing as `utils` in other files is ambiguous in a codebase that also contains `carouselUtils`, `dragUtils`, `sliderUtils`, `utilsShared`, and `vectorUtils`.

**`prim` / `sub`** in `vector.resolveByAxis1D()` in `vectorUtils.ts` — "prim" means primary axis, "sub" means secondary/cross axis. These abbreviations require domain knowledge to decode.

**`delta1D`** on `CtxCarousel` and `CtxSlider` in `ctxType.ts` — not self-documenting. This represents the axis-decomposed movement magnitude but the name gives no indication of what "1D" refers to or which axis it corresponds to.

**`Normalized1D`** in `ctxType.ts` — the type name doesn't convey what it contains. It is actually an axis-decomposed measurement bundle with main/cross components for position, delta, and size.

**`ctx` vs `Context`.** `buildContext()` returns a `Context` type (raw DOM extraction), but all other "ctx" references (`CtxType`, `CtxCarousel`, `.ctx` on descriptors) refer to the mutable solver/pipeline context. Two different concepts sharing the same naming root.

**Stale comments.** `//intentUtils.js` at line 8 of `gestureUtils.ts` is a leftover reference from a rename. Comment `//future me -> probably return pressCancel...` in `interpreter.ts` is an unresolved TODO. Comment `//carousel only` above `vector.resolveDirection()` in `vectorUtils.ts` documents a usage constraint that should ideally be enforced by the type system.

**`utilsShared.ts`** — generic name. Its actual contents are `normalizeBase()` and `exceedsCrossRange()`, which are axis normalization and hysteresis gating responsibilities.

**`onVolumeChange`** in `Slider.tsx` — the slider is a general-purpose primitive, not a volume control. This callback name leaks a specific use case into the generic component API.

**Inconsistent naming for "offset".** Carousel uses `offset` (1D number). Drag uses `offset` (Vec2). Slider has `offset` (unused 1D number) plus `value`. Same conceptual field with different types and names across the three primitives.

### 5. Consistency Across Primitives — 7/10

The three primitives follow the same architectural skeleton (Component → useStore / useSizing / useMotion hooks), and the interaction pipeline treats them uniformly through discriminated unions. However, there is meaningful structural drift.

**Solver event handler sets differ.** Carousel handles `{swipeStart, swipe, swipeCommit}`. Drag handles `{swipeStart, swipe, swipeCommit}`. Slider handles `{press, swipeStart, swipe, swipeCommit}`. Only slider handles `press`. Only carousel produces `swipeRevert` (via event override through the solver's return value spread). All solvers are typed as `Partial<Record<EventType, ...>>` which makes these asymmetries invisible at the type level.

**Store method sets differ.** `carouselStore` has `swipeRevert`; `dragStore` and `sliderStore` do not. `sliderStore` has `press`; others do not. The `pipelineType.ts` `EventMap` type documents this but nothing enforces completeness at compile time.

**Motion hook return shapes differ.** `useCarouselMotion` returns `{ styleForRole, onTransitionEnd }` (callback functions) while `useDragMotion` returns `{ itemStyle }` (memoized object) and `useSliderMotion` returns `{ thumbStyle }` (memoized object). Carousel's callback-based approach is functionally motivated by its role-mapped styling, but the architectural shape is inconsistent.

**Sizing hooks have different observer strategies.** `useCarouselSizing` observes 1 element. `useDragSizing` observes 2 (item + container). `useSliderSizing` observes 2 (slider + thumb). The observation target count varies by need, but the hooks share no common abstraction or pattern.

**Data attribute patterns differ.** Carousel sets `data-lock-prev-at`, `data-lock-next-at`. Drag sets `data-snap-x`, `data-snap-y`, `data-locked`. Slider sets `data-press`. The `data-react-*` prefix for reaction controls is inconsistent: Button uses `data-react-press`, Slider uses `data-react-swipe`, Carousel and Drag use `data-react-swipe-commit`.

**Carousel lacks an explicit `interactive` flag on the store.** The `interactive` prop is used in the component to conditionally call `setCount` and override scenes, but the store itself doesn't track interactivity. Drag uses `locked` for a similar purpose.

### 6. Error Handling & Edge Cases — 6/10

The system handles common cases but has several silent failure paths and aggressive recovery mechanisms that could cause surprising behavior.

**Gesture map overflow wipe.** `interpreter.onDown()` clears ALL gestures when the map exceeds 10 entries. This kills any active, in-progress gestures for other pointers. A more targeted approach (e.g., evicting the oldest gesture) would be safer.

**`pointercancel` treated as `pointerup`.** In `pointerBridge.ts`, `pointercancel` reuses the same handler as `pointerup`. This means cancelled gestures go through `interpreter.onUp()` and can potentially trigger `swipeCommit` rather than a clean abort/revert.

**No validation of `id` uniqueness.** All stores use `id` as the binding key. If two component instances share the same `id`, they silently read/write the same binding. No warning is emitted.

**ResizeObserver callback race.** In `useCarouselSizing`, `useDragSizing`, and `useSliderSizing`, the `updateLaneSize` closure captures the element ref at effect setup time. A ResizeObserver callback could fire in the gap between React unmount and `observer.disconnect()`. The `if (!el)` guards help but the store setter is still called on a potentially-deleted binding.

**`buildDesc.buildCarouselData()` returns `null` silently** when the store binding doesn't exist for the given id. The null propagates up through `buildCarousel()` and `resolveFromElement()`, silently dropping the event. No logging indicates why a carousel element was found in the DOM but couldn't be resolved to a descriptor.

**`exceedsCrossRange()` rejects silently.** When a swipe exceeds the hysteresis boundary in `utilsShared.ts`, the solver returns `{ storeAccepted: false }` with no feedback to the user or debug logging about why the interaction was rejected.

**`interpreter.onMove()` can leave a gesture in PENDING state indefinitely.** If `isSwipeableDescriptor` returns `false` and `findLaneInDom` also returns `null`, the function returns `null` without transitioning or cleaning up. The gesture stays PENDING until `onUp` is called, which triggers a `pressRelease` — potentially semantically wrong for a non-pressable element.

### 7. Performance — 7/10

The architecture avoids the most common performance pitfalls. Pointer capture prevents global listener pollution. Zustand subscriptions use shallow comparison. DOM queries via `elementsFromPoint` are limited to gesture start and transition rather than every frame.

**Immer produce on every swipe frame.** During active drag at 60fps, each `pointermove` triggers an immer-wrapped `set()` call in the active store. Immer's proxy-based structural sharing has measurable overhead compared to direct assignment, and it compounds at high event frequencies.

**No ResizeObserver callback debouncing.** All three sizing hooks call store mutations directly from the ResizeObserver callback. ResizeObserver can fire multiple times during layout transitions. No `requestAnimationFrame` batching or debouncing is applied.

**`carouselStore.setSize()` performs an equality check** before setting — `if (s.size.x === trackSize.x && s.size.y === trackSize.y) return`. This correctly avoids unnecessary re-renders. However, `sliderStore.setSize()` and `sliderStore.setThumbSize()` do NOT perform this check, meaning every ResizeObserver callback triggers a store update regardless of whether the value changed.

**`useCarouselMotion` invalidates callbacks on every drag frame.** `useCallback` depends on `[translate, axisSize, delta, transition]`. During active drag, `delta` changes every frame, invalidating and recreating both `styleForRole` and `onTransitionEnd` callbacks.

**`normalizedDelta()` on every move.** `interpreter.onMove()` calls `utils.normalizedDelta(g.totalDelta)` which invokes `sizeStore.getState().normalizeParameter()` twice per frame (for x and y). Minimal overhead individually but non-zero.

**Separate ResizeObserver instances per component.** Each Drag and Slider component creates its own ResizeObserver observing 2 elements. No observer pooling across components.

### 8. Testability — 7/10

The solver and utility layers are highly testable. The pure-function design of `vectorUtils`, `carouselUtils`, `dragUtils`, `sliderUtils`, and `utilsShared` makes them ideal unit test targets with no dependencies to mock.

**`interpreter.ts` is a stateful singleton with no reset.** The `gestures` map is a module-level variable. There is no exported `reset()` or `clear()` function. Tests cannot reliably isolate gesture state between test cases without reloading the module.

**`buildDesc` reads from Zustand stores.** Testing `buildDesc.buildCarouselData()` requires either a populated `carouselStore` or mocking `carouselStore.getState()`. The direct import coupling prevents simple pure-function unit testing.

**`domQuery` depends on `document.elementsFromPoint()`.** Testing requires a full DOM environment (JSDOM or browser). No abstraction layer allows injection of mock element queries.

**`gestureUtils` depends on `sizeStore`.** The `normalizedDelta()` and `swipeThresholdCalc()` functions call exported functions from `sizeStore.ts`. These are stateful dependencies hidden behind function-style imports.

**`pipeline.orchestrate()` is an integration point.** It calls interpreter → solver → store → updater in sequence. Testing requires either mocking 4+ modules or running a full integration test. No dependency injection mechanism exists.

**React hooks require a render context.** All `use[X]Store`, `use[X]Sizing`, and `use[X]Motion` hooks need a React render environment. The store hooks specifically init/delete store bindings in effects, requiring `renderHook` or equivalent.

**`domUpdater` is easily testable.** It takes a `CtxType` and mutates a plain `HTMLElement`. Creating stub elements and asserting attribute/event changes is straightforward.

**Zustand stores test well standalone.** `carouselStore.getState().init('test')` → mutate → assert is idiomatic Zustand testing with no special setup required.

### 9. Dead or Redundant Code — 7/10

The codebase is reasonably lean but contains several unused artifacts and duplicated patterns.

**`Slider.offset` is dead state.** Defined in `sliderStore.ts`, initialized to `0`, never mutated by any store method (`press`, `swipeStart`, `swipe`, `swipeCommit` all update `value`, not `offset`). Subscribed to in `useSliderStore` via the full binding spread, contributing to unnecessary shallow-compare work.

**`Axis1D` type** in `primitiveType.ts` is defined as `'horizontal' | 'vertical'` but the codebase universally uses `Exclude<Axis, 'both'>` to express the same constraint.

**`EventMap` type** in `pipelineType.ts` defines event-to-method-name tuples but is only used as `EventMap['carousel'][number]` to derive Pick types. The tuple structure adds no value over directly listing the keys in the Pick.

**`Builder` interface exported from `buildDesc.ts`** — used only internally within the file. The export is unnecessary.

**`typeof delta !== "object"` guard** in `vector.resolveDirection()` in `vectorUtils.ts` — `delta` is typed as `number`, so this check is always `true`. This is a dead branch from an earlier iteration when `delta` may have been `Vec2 | number`.

**`if (!value)` guard** in `vector.resolveByAxis1D()` in `vectorUtils.ts` — `value` is typed as `Vec2` which is always truthy (an object). Returns `{ prim: undefined, sub: undefined }` on an impossible path.

**Duplicated sizing hook pattern.** `useCarouselSizing`, `useDragSizing`, and `useSliderSizing` all follow the same structure: create ResizeObserver → observe element(s) → measure dimensions → call store setter → disconnect on cleanup. This pattern could be extracted into a shared hook.

**Stale comments.** `//intentUtils.js` in `gestureUtils.ts` is a leftover from a rename. `//carousel only` in `vectorUtils.ts` documents a usage constraint rather than enforcing it.

**`CtxSwipeType`** defined in `ctxType.ts` as `Exclude<CtxType, CtxButton>` — does not appear to be referenced outside the type file itself.

### 10. Scalability — 6/10

The architecture scales well for the current 4-primitive system but has pressure points that would compound with growth.

**Adding a primitive requires ~8 file changes.** A new type requires: new entries in `InteractionType` and `EventType` (`primitiveType.ts`), new descriptor type (`descriptor.ts`), new data type (`dataType.ts`), new ctx type (`ctxType.ts`), new pipeline type (`pipelineType.ts`), new builder methods (`buildDesc.ts`), new pipeline case (`pipeline.ts`), new solver + utils, new store, new component + hooks, and a new route in `Interactive.tsx`. There is no registration or plugin mechanism.

**`pipeline.orchestrate()` switch grows linearly.** Each new primitive adds a new case with solver routing, gesture update handling, and store mutation. The carousel/slider/drag cases are already ~10 lines each with type-specific branching (e.g., slider's `gestureUpdate` pass-through).

**Module-level singleton state in `interpreter.ts`.** The `gestures` map is a global mutable object. This prevents running multiple interpreter instances (e.g., for testing, SSR, or isolated app sub-trees).

**`buildDesc.ts` accumulates store imports.** Every new primitive with state adds another store import and `build[X]Data()` method to this already-large factory module (~170 lines with 4 types).

**Solver type widening.** Each solver is typed as `Partial<Record<EventType, ...>>` — meaning any event type could theoretically map to any solver. As the `EventType` union grows, the potential key space grows but most keys remain unmapped. This provides flexibility but reduces type safety.

**No shared hook abstraction.** Each primitive independently implements `useStore`, `useSizing`, `useMotion` hooks. Adding a primitive means reimplementing these patterns from scratch rather than composing from shared building blocks.

**Single-threaded event processing.** `pipeline.orchestrate()` processes events synchronously. At very high pointer event volume (e.g., multi-touch on many simultaneous drag elements), all processing is serial through one function.
