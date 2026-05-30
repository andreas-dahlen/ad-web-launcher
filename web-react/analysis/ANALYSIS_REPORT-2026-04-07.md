# Analysis Report — Interaction & Components System

## Overview

The system is architecturally sound with a well-defined unidirectional pipeline (bridge → interpreter → solver → store → domUpdater) and a consistent primitive pattern built on discriminated unions. Store boundaries are clean, solvers are mostly pure, and the component layer follows a repeatable hook-based structure. The primary weaknesses are type safety gaps in solver return types and `CtxPartial` definitions, naming confusion across overloaded concepts like "context", dead commented-out code scattered across multiple files, and missing defensive checks at system boundaries — particularly non-null assertions on store lookups and assertion functions that silently degrade in production. Overall this is a well-structured system with addressable issues, none of which are architectural.

## Overall Score: 7/10

---

## Findings

### 1. Type Safety — 6/10

`DragCtxPartial` in `ctxType.ts` is defined as `Partial<Pick<CtxDrag, 'storeAccepted'>>` — it only includes `storeAccepted`. However, `dragSolver.swipeCommit` in `dragSolver.ts` returns `{ delta, storeAccepted, direction }`. The extra `delta` and `direction` fields are invisible to the type system. They flow through the pipeline's spread (`ctx = { ...ctx, ...sr }`) at runtime, but TypeScript cannot verify this. `CarouselCtxPartial` and `SliderCtxPartial` correctly include their additional fields; `DragCtxPartial` has drifted out of sync.

`buildDesc.buildCarouselData`, `buildSliderData`, and `buildDragData` in `buildDesc.ts` all use the non-null assertion operator: `carouselStore.getState().get(ctx.id)!`. If the store hasn't been initialized for that id — a plausible race between component mount and a pointer event, or after an unmount triggers `delete` — this produces an uncaught TypeError with no recovery path or error message.

The assertion functions in `gestureTypeGuards.ts` (`descIs`, `isCarousel`, `isDrag`, `isSlider`, `isButton`) use the `asserts` return type but only `throw` when `VITE_DEBUG === 'true'`. In production they `console.warn` and execution continues — the `asserts` keyword tells TypeScript the type is narrowed, but the runtime hasn't enforced it. Downstream code proceeds with a potentially incorrect type.

In the bridge callbacks within `Button.tsx`, `Carousel.tsx`, `Slider.tsx`, and `Drag.tsx`, `reaction.detail` is `any` (the default for `CustomEvent`). No type narrowing is applied before accessing `.event` or passing the detail to callback props. The callback prop signatures type detail as `unknown`, which is safe from the consumer's perspective but means the component internals operate on untyped data.

`buildContext` in `buildContext.ts` casts `ds.axis as Axis` and `ds.type as InteractionType` after membership checks against `VALID_AXES` and `VALID_TYPES`. These Sets are typed as `Set<string>` rather than `Set<Axis>` or `Set<InteractionType>`, so TypeScript cannot narrow through them — the casts are safe at runtime but opaque to the compiler.

All three solver types use `Partial<Record<EventType, (desc) => XxxCtxPartial>>`, which means missing event handlers silently return `undefined` via optional chaining in the pipeline. This works at runtime but provides no compile-time guarantee that required events are actually covered by each solver.

### 2. State Management — 7/10

Store boundaries are well-scoped. Each primitive has its own Zustand store (`carouselStore`, `sliderStore`, `dragStore`) plus a global `sizeStore`. No cross-store writes exist. Cross-store reads only occur in `buildDesc`, which snapshots data into descriptors — an appropriate read-only boundary.

The `Record<string, T>` keying pattern is consistent across all three primitive stores, cleanly supporting multiple instances of the same component. The init/delete lifecycle is managed symmetrically via the `useXxxZustand` hooks (`useCarouselZustand`, `useSliderZustand`, `useDragZustand`), each calling `init` on mount and `delete` on unmount cleanup.

Subscription granularity is coarse. `useCarouselZustand`, `useSliderZustand`, and `useDragZustand` subscribe to the full sub-object `s.xxxStore[id]`. With immer, any field change within that sub-object produces a new reference, triggering a re-render. During an active drag, `swipe` events fire on every `pointermove`, meaning the store's `swipe` method → immer `set` → new reference → React re-render on every pointer move. Only `useSize` in `sizeStore.ts` uses `useShallow` for selective subscription.

Each store mixes React-facing setup methods (`init`, `delete`, `setSize`, `setCount`, `setConstraints`) with pipeline-facing mutation methods (`swipe`, `swipeStart`, `swipeCommit`, `swipeRevert`). These serve two different consumers — the component lifecycle and the interaction pipeline — and are interleaved in the same type interface.

`carouselStore.setPosition` in `carouselStore.ts` uses `requestAnimationFrame` to flip `settling` back to `false`. This is the only store method with async/side-effect behavior, creating a subtle coupling to the browser frame cycle that is not present in any other store method.

### 3. Separation of Concerns — 7/10

`pipeline.ts` is a clean orchestrator. It connects interpreter → solver → store → domUpdater with no business logic of its own beyond type-based routing. Each branch does the same thing: run the solver, merge the result, call the store if accepted, then update the DOM.

`intentUtils.ts` is a mixed-responsibility module. It contains reaction checking (`resolveSupports`), coordinate math (`normalizedDelta`), axis resolution (`resolveAxis`), threshold logic (`swipeThresholdCalc`), a lane fallback that performs DOM interaction (`resolveSwipeStart` calls `domQuery.findLaneInDom`), and descriptor mutation (`resolveCancel`). These span pure utilities, domain logic, and DOM queries within a single file.

`buildDesc.ts` concentrates coupling by importing all three stores, `buildContext`, `domQuery`, and multiple type modules. It's the single point that knows how to construct every descriptor variant — this is its job, but any store shape change requires editing this file.

The interpreter has a side-channel: `interpreter.applyGestureUpdate` in `interpreter.ts` mutates a gesture's descriptor state mid-pipeline. It's called from the pipeline's slider branch only. This is a back-channel from the pipeline into the interpreter that goes against the otherwise one-directional flow (bridge → interpreter → solver → store → updater).

`domUpdater.ts` is well-scoped — it does exactly one thing: applies DOM attributes and dispatches custom events. No logic leakage.

`bridge.ts` (the `usePointerForwarding` hook) is well-scoped — it captures pointer events, forwards them to the pipeline, and listens for reaction custom events. Clean single responsibility.

### 4. Naming & Discoverability — 6/10

The file is named `bridge.ts` but the exported hook is `usePointerForwarding`. A developer searching for "bridge" wouldn't find the hook name, and a developer looking for "pointer forwarding" wouldn't think to look in a file called "bridge".

"Context" is overloaded. `buildContext` in `buildContext.ts` returns a `Context` interface (DOM dataset → structured object). `CtxType` / `CtxCarousel` / `CtxSlider` / `CtxDrag` in `ctxType.ts` are the mutable event contexts flowing through the pipeline. Both are called "context" in documentation and variable names, serving very different purposes.

Store name shadowing is present in all three stores. `carouselStore` is both the Zustand store export and the key inside the store state, so accessing data reads as `carouselStore.getState().carouselStore[id]`. Same pattern for `sliderStore` and `dragStore`.

`resolveGate` in `utilsShared.ts` is an opaque name. It performs a cross-axis hysteresis check — determining whether the pointer has moved too far off the main axis to continue the gesture — but "gate" gives no hint about what is being gated or why.

`intentUtils.ts` is vague as a module name. The word "intent" isn't used elsewhere in the system's vocabulary.

`useCarouselZustand`, `useSliderZustand`, and `useDragZustand` name the implementation library in the hook rather than the abstraction. This is an unusual convention that ties the API surface to the state management library.

`normalizeParameter` in `sizeStore.ts` is ambiguous. The name doesn't indicate it's converting CSS pixels to device-independent pixels via the scale factor.

`pipelineType.ts` is a catch-all. It contains `PointerEventPackage`, `InterpreterFn`, `EventMap`, and store function pick types (`CarouselFunctions`, `SliderFunctions`, `DragFunctions`) — loosely related items under one umbrella name.

### 5. Consistency Across Primitives — 7/10

Hook structure is consistent in pattern but differs in count. Carousel has 5 hook files (including the fully-commented-out `useCarouselScenes.ts` and the auxiliary `useAugmentedScenes.ts`), Slider has 3, and Drag has 3. The extras in Carousel are inherent to its scene-management nature.

Store hooks follow an identical pattern across all three: `useEffect` → `init`/`delete` for lifecycle, and a store selector `s => s.xxxStore[id] ?? DEFAULTS` for subscription.

Sizing hooks all use `ResizeObserver` but observe different element counts appropriate to each primitive: Carousel observes 1 element (the track), Slider observes 2 (track + thumb), and Drag observes 2 (item + container). All clean up via `observer.disconnect()` on unmount.

Motion hooks return different shapes reflecting genuinely different UI semantics: Carousel returns `{ styleForRole, onTransitionEnd }`, Slider returns `{ thumbStyle }`, and Drag returns `{ itemStyle }`.

`DragCtxPartial` has drifted from the pattern established by `CarouselCtxPartial` and `SliderCtxPartial`, as detailed in the Type Safety section.

The pipeline branches in `pipeline.ts` are nearly identical for carousel and drag, with slider having the extra `interpreter.applyGestureUpdate` call. Carousel and drag have commented-out `applyGestureUpdate` lines, suggesting explored functionality that only landed for slider.

Solver event coverage differs appropriately by primitive: Carousel handles `swipeStart/swipe/swipeCommit`. Slider handles `press/swipeStart/swipe/swipeCommit` (extra `press` for click-to-seek). Drag handles `swipeStart/swipe/swipeCommit`. Carousel uniquely has `swipeRevert` on its store. These differences are semantically motivated.

`Drag.tsx` has a duplicate `data-type="drag"` attribute — both the outer container div and the inner drag-item div carry it. The outer container has no `data-id`, so `buildContext` produces `id: ''` and it's skipped by `buildReactions`, but it is a needless attribute that could cause confusion during debugging.

### 6. Error Handling & Edge Cases — 6/10

The non-null assertion operators (`!`) in `buildDesc.ts` lines 101–111 provide no error message or recovery if a store entry is missing. A race condition between component unmount (which calls `store.delete(id)`) and an in-flight gesture that triggers `buildDesc` would produce an uncaught TypeError.

The bridge in `bridge.ts` gates multi-pointer per element: it tracks `activePointerId` and skips new `pointerdown` events while `isActive` is true. A second finger on the same element is silently ignored. This appears intentional but is not documented.

`setPointerCapture` in `bridge.ts` line 55 (`el?.setPointerCapture(e.pointerId)`) is not wrapped in a try/catch. If the element is removed from the DOM between event creation and handler execution, this call can throw.

The assertion functions in `gestureTypeGuards.ts` degrade silently in production, as detailed in the Type Safety section. Code continues execution after a failed assertion with the wrong type.

The `gestures` record in `interpreter.ts` (module-level `const gestures: GestureMap = {}`) relies entirely on `onUp` or `deleteGesture` for cleanup. If a pointer event sequence is interrupted without a cancel/up event (browser tab switch, unexpected focus loss, browser-level cancellation not routed to `pointercancel`), the entry persists indefinitely. There is no periodic cleanup, TTL, or max-entries mechanism.

`e.stopPropagation()` is called on `pointerdown` in `bridge.ts`. This prevents nested interactive elements (e.g., a Button inside a Carousel) from allowing the parent to see the event. This is correct for the single-pointer-per-element model but could confuse developers expecting standard event bubbling.

The `useEffect` cleanup in `useXxxZustand` hooks calls `store.getState().delete(id)`. Under React strict mode's double-mount behavior, init → delete → init runs, which is handled correctly by the `if (get().xxxStore[id]) return` guard in each store's `init`. This is sound.

### 7. Performance — 7/10

During an active drag or slide, each `swipe` event calls the store's `swipe` method, which triggers an immer `set`, producing a new sub-object reference. The `useXxxZustand` subscription fires, causing a full component re-render on every `pointermove` event. The `useMemo` calls in motion hooks mitigate wasted work downstream, but the component function body still runs. This applies to all three swipeable primitives.

Descriptor reuse during moves is efficient. The interpreter's `onMove` mutates the existing gesture's `desc.ctx` fields rather than creating new descriptor objects. This avoids allocation in the hot path.

`document.elementsFromPoint` is called only during `onDown` (via `domQuery.findTargetInDom`) and during swipe start (via `domQuery.findLaneInDom`) — not on every move. This is the correct approach.

One `ResizeObserver` is created per component instance. With many primitives on screen this could add up, but modern browsers batch observer callbacks efficiently. Each observer disconnects on unmount, so there is no leak.

`normalizeParameter` and `getAxisSize` are called from hot paths (solvers, intentUtils). They perform synchronous `sizeStore.getState()` reads with negligible overhead.

The `requestAnimationFrame` call in `carouselStore.setPosition` is a single rAF per commit to flip `settling`, not a recurring loop.

### 8. Testability — 7/10

Solvers and solver utilities are highly testable. `carouselSolver`, `sliderSolver`, `dragSolver` and their utility modules (`carouselUtils`, `sliderUtils`, `dragUtils`, `vectorUtils`) are plain functions that take descriptor/data objects and return results. Mock a descriptor, call the function, assert the output.

`vectorUtils` is a pure math module with no external dependencies — perfectly unit-testable.

Stores are testable without React. Call `store.getState().init(id)`, invoke mutation methods, assert state via `getState()`. This is standard Zustand testing.

The interpreter (`interpreter.ts`) is harder to test. It depends on `domQuery`, which calls `document.elementsFromPoint`. The `gestures` map is module-level private with no reset or inspection API. Testing requires either mocking `domQuery` or providing a real DOM environment.

`buildDesc` requires populated store state. Since it reads from all three stores via `getState()`, tests need either pre-initialized stores or mocks. Combined with `buildContext` needing `HTMLElement.dataset`, this module is moderately difficult to test in isolation.

`domQuery.findTargetInDom` depends on `document.elementsFromPoint`, which is not available in jsdom. Testing requires a browser environment or polyfill.

Components follow standard React patterns. No unusual barriers beyond the custom `reaction` event system, which would need manual `dispatchEvent` calls in tests.

### 9. Dead or Redundant Code — 6/10

`useCarouselScenes.ts` is entirely commented out — 27 lines of dead code serving no purpose.

`carouselStore.ts` contains commented-out `scenes: number[]` field and `setScenes` method.

`ctxType.ts` has a commented-out `eventChange?: string` field on `CtxCarousel`.

`primitiveType.ts` contains a commented-out `Mutable<T>` utility type.

`resolveCancel` in `intentUtils.ts` appears unused. The interpreter handles cancellation directly by setting `desc.ctx.cancel` in `interpreter.ts` lines 101–103. No call site for `resolveCancel` was found in the codebase.

`dragSolver.swipeCommit` computes a `direction` via `dragUtils.resolveDirection`, but `CtxDrag` has no `direction` field — it's commented out with a note in `ctxType.ts`. The computed value exists at runtime on the spread object but is invisible to TypeScript and apparently unconsumed by any downstream code.

`isGestureType` in `gestureTypeGuards.ts` asserts that a value is one of the four `InteractionType` values, but if the input is already typed as `InteractionType`, the assertion adds nothing. No usage was found.

The outer container div in `Drag.tsx` has a redundant `data-type='drag'` attribute. It has no `data-id`, so it's never matched by the interaction system.

Two commented-out `applyGestureUpdate` lines exist in `pipeline.ts` for the carousel and drag branches.

### 10. Scalability — 7/10

Adding a fourth primitive requires touching approximately 10 files: a new store, solver, solver utils, `CtxPartial` type, `Descriptor` union variant, component + hooks, a pipeline switch branch, an `InteractionType` extension, an `EventMap` entry, and a `buildDesc` builder method. The discriminated union pattern ensures TypeScript catches missing cases via exhaustiveness checking, but the manual wiring is verbose.

The pipeline switch in `pipeline.orchestrate` grows linearly with each new primitive. The branches are structurally similar but each has slight behavioral differences (e.g., `applyGestureUpdate` for slider only), making a fully generic handler difficult without over-abstracting.

The `gestures` map in `interpreter.ts` is a module-level singleton. This works for a single interaction context but could not support multiple independent systems (e.g., iframes or concurrent React roots).

There is no dynamic registration mechanism. Solvers, stores, and components are all statically imported. This is appropriate for the current three-primitive scale but means every new primitive requires code changes across the system rather than a configuration-driven registration.

Pointer event volume is handled well in the hot path. The `onMove` → interpreter → solver → store → domUpdater chain avoids unnecessary allocations. Descriptors are reused during moves. At typical pointer input rates of 60–120 events/sec, the per-event overhead including immer is negligible.

Team concurrency is reasonable. Different developers can own different primitives in isolation (component + hooks + solver + solver utils + store). The primary contention points are `pipeline.ts`, the shared type files, and `buildDesc.ts`.
