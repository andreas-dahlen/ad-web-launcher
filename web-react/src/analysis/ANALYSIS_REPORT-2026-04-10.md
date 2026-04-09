# Analysis Report — Interaction & Components System

## Overview
The interaction + components system is a well-architected, purpose-built gesture engine with clean layering and strong foundational patterns. The pipeline → interpreter → solver → store → updater flow is coherent, solvers are pure and testable, and Zustand stores are properly scoped per primitive. The main weaknesses are naming overloads (especially around "context"), some dead or slider-specific code living in shared types, a potentially stale `onTransitionEnd` class guard in carousel, and the linear boilerplate cost of adding new primitives. Type safety is good but not airtight — the solver→pipeline boundary relies on runtime guards and `as` casts rather than compile-time guarantees. Error handling covers the common cases (pointer capture, gesture map overflow, disabled toggling) but has gaps around `NaN` propagation, unmount timing, and division-by-zero in edge cases. Overall this is a healthy, coherent system that would benefit from targeted tightening rather than any structural rework.

## Overall Score: 7/10

---

## Findings

### 1. Type Safety — 7/10

The type system is generally well-constructed. The `Descriptor` discriminated union with its `type` field enables clean narrowing in `pipeline.ts` and `buildDesc.ts`. The primitive types in `primitiveType.ts` (`Axis`, `Direction`, `Vec2`, `EventType`) are precise and reused consistently. No `any` usage was detected anywhere in the codebase — good discipline throughout.

All three solvers are typed as `Partial<Record<EventType, (desc) => XCtxPartial>>`. This means the compiler cannot verify that a solver handles exactly the events declared in `pipelineType.ts`'s `EVENT_MAP`. A missing or extraneous handler is invisible at compile time. `CarouselCtxPartial` includes an optional `event` field. When the carousel solver returns `{ event: 'swipeRevert' }`, this is spread into `ctx` via `{ ...ctx, ...sr }` in `pipeline.ts`. The resulting type is not narrowed — `ctx.event` could be any `EventType`, yet the pipeline indexes into store methods via `ctx.event as keyof CarouselFunctions`. The cast is guarded at runtime by `CAROUSEL_EVENTS.has()`, but the type system relies on the cast being correct rather than proving it.

`GestureMap` is typed as `Record<number, GestureState>`. TypeScript treats `Record<number, T>` as always-present for any numeric key. The code correctly guards with `if (!g) return null`, but the type does not require this — a future developer could skip the guard without a compiler error.

`Normalized1D` has all optional fields (`mainSize?: number`, `mainDelta?: number`, etc.). Every consumer must null-check every field. This is deliberate (the `axis === 'both'` case returns `{}`), but it means solver logic is littered with null guards like `if (norm.mainDelta == null)` that could be eliminated with a more precise union type.

`buildContext` in `buildContext.ts` converts `data-*` attributes to numbers via `Number(ds.snapX)`. Non-numeric attribute strings produce `NaN`, which would propagate silently through solver math with no guard at the conversion boundary.

### 2. State Management — 8/10

Store boundaries are well-scoped. Each primitive owns its own Zustand store (`carouselStore`, `dragStore`, `sliderStore`) with immer middleware, and the global `sizeStore` handles viewport normalization independently. The `bindings: Record<string, T>` pattern allows multiple instances keyed by `id`.

`carouselStore.setPosition` uses `requestAnimationFrame` to clear `settling`. This introduces an async browser-coupled side effect inside the store. If the component unmounts between the store call and the RAF callback, the callback writes to a possibly-deleted binding (mitigated by `if (!s) return`, but still a design concern at the store layer).

Each `use[X]Store` hook subscribes to the entire binding object via `useShallow` (`s.bindings[id] ?? DEFAULTS`). `useShallow` prevents re-renders when *other* bindings change, but any field change *within* the subscribed binding triggers a re-render. For carousel, this means changes to `settling` and `pendingDir` (internal bookkeeping not used in JSX) cause re-renders. Similarly, the drag component re-renders when `minX`/`maxX`/`minY`/`maxY` constraints change even though the component does not render these values directly.

There is no cross-store coupling at the store layer. The only place multiple stores are read together is `buildDesc.ts`, which is the descriptor assembly phase — appropriate for that layer. Stores never import or subscribe to each other. `sizeStore` exports free functions (`getAxisSize`, `normalizeParameter`) that call `getState()` synchronously, providing a clean pattern for imperative code (`gestureUtils`, `axisUtils`) to access global sizing without React subscriptions. Store `init` methods are idempotent — each checks `if (get().bindings[id]) return`, preventing double-initialization on React strict mode double-mounts.

### 3. Separation of Concerns — 7/10

The overall architecture has clean boundaries: `pointerBridge` → `pipeline` → `interpreter` → `solver` → `store` → `domUpdater`. Each module owns a distinct phase of the gesture lifecycle.

There is a circular dependency between `domQuery.ts` and `buildDesc.ts`. `domQuery` imports `buildDesc` (to resolve descriptors from elements) and `buildContext` (to check axis compatibility in `findLaneInDom`). `buildDesc` imports `domQuery` (for `resolveElOffsetInDom`). JavaScript module resolution handles this at runtime, but it creates a conceptual cycle where the "find element" module and the "build descriptor" module depend on each other.

`buildDesc` reaches into all three Zustand stores directly. `buildCarouselData`, `buildSliderData`, and `buildDragData` each call their respective store's `getState().get(id)`. This is the designated context-gathering phase, but it means `buildDesc` has explicit knowledge of all three store shapes.

`interpreter.ts` couples gesture state management with DOM resolution. The `onMove` function handles both gesture phase transitions (PENDING → SWIPING) and calls `domQuery.findLaneInDom` for lane reassignment. Threshold checking (`gestureUtils.swipeThresholdCalc`) and axis intent resolution happen inline within the interpreter rather than being delegated.

`gestureUtils` is a mixed utility bag containing normalization (`normalizedDelta`), axis resolution (`resolveAxis`), threshold detection (`swipeThresholdCalc`), and a type guard (`isSwipeableDescriptor`). These serve different concerns — math, config reading, and type narrowing — within a single module.

`domUpdater` has two responsibilities: DOM attribute manipulation and custom event dispatch. These are small and tightly coupled in practice.

### 4. Naming & Discoverability — 6/10

The system is navigable for someone who understands the architecture, but several naming choices create friction for newcomers.

"Context" is overloaded across three meanings. `CtxType` / `CtxCarousel` / `CtxSlider` / `CtxDrag` represent pipeline payloads that flow through solvers and into stores. `DomContext` represents parsed DOM element metadata built by `buildContext`. The function `buildContext` builds a `DomContext`. Three distinct concepts share the "context" name.

The `Reactions` interface in `baseType.ts` describes an element's capabilities (`pressable`, `swipeable`, `modifiable`). A developer unfamiliar with the codebase would not infer this meaning from the name "Reactions."

Both `data-press` and `data-react-press` appear on `Button.tsx` elements. `data-press` enables pressability in the pipeline via `buildReactions`. `data-react-press` enables React event dispatch via the `onReaction` callback. The naming convention (`react-` prefix) is consistent but the relationship between the two is non-obvious without reading both systems.

`delta1D` is used on both `CtxCarousel` and `CtxSlider` but represents different things: for carousel it is a pixel offset from the resting position, for slider it is a logical value (e.g., 0–100). The same field name carries different semantics per primitive.

`GestureUpdate` in `dataType.ts` is named generically but is slider-specific — its fields are `sliderStartOffset` and `sliderValuePerPixel`.

`buildDesc` is an object literal that uses `this` references (`this.buildCarousel`, `this.buildReactions`), which is unusual for a TypeScript module pattern. A developer might expect a class or standalone functions.

On the positive side, file naming is consistent and discoverable across primitives: `xSolver.ts`, `xStore.ts`, `xUtils.ts`, `useXMotion.ts`, `useXSizing.ts`, `useXStore.ts`.

### 5. Consistency Across Primitives — 7/10

The three swipeable primitives (Carousel, Drag, Slider) follow the same architectural pattern with intentional asymmetries where behavior genuinely differs, plus some unintentional drift.

Slider has a `press` event handler in both `sliderSolver` and `sliderStore`; Carousel and Drag do not. This is a genuine behavioral difference (tap-to-position) but it means the solver interface shape varies between primitives. Carousel has `swipeRevert` in both its solver and store; Drag and Slider do not. Only carousel can fail a commit and snap back.

Drag constraints use flat keys (`minX`, `maxX`, `minY`, `maxY`) on the store type. Slider constraints use a nested object (`{ min, max }`). This inconsistency in data shapes means no generic constraint-handling code can exist.

Sizing hooks have the same naming pattern but different signatures: `useCarouselSizing` takes `{ elRef, axis, id }`, `useDragSizing` takes `{ elRef, containerRef, id }`, `useSliderSizing` takes `{ elRef, thumbRef, id }`. The different signatures reflect genuine structural differences in what each primitive measures.

Motion hook return shapes differ. `useCarouselMotion` returns `{ styleForRole, onTransitionEnd }` — a function plus a callback. `useDragMotion` returns `{ itemStyle }`. `useSliderMotion` returns `{ thumbStyle }`. The carousel's function-returning pattern is necessary for its multi-slot rendering but breaks parallelism with the other two.

Slider's `onReaction` handler in `Slider.tsx` performs value inversion for vertical axis and deduplication via `lastEmitted` ref, making the component layer notably thicker than Carousel and Drag's simple event-type guard patterns.

`useSliderMotion` defines a `BASE_STYLE` constant with `willChange: "transform"` and spreads it into every style object. `useCarouselMotion` and `useDragMotion` do not use `willChange`.

### 6. Error Handling & Edge Cases — 6/10

The system handles the happy path well and has some defensive code, but several edge cases could produce silent failures.

If a component unmounts mid-gesture, `pointerBridge` cleanup calls `pipeline.abortGesture(pointerId)`, which deletes the gesture from the interpreter. However, the Zustand store may still have `dragging: true` for that binding. The `use[X]Store` cleanup calls `store.delete(id)`, but effect cleanup order is not guaranteed — there is a window where stale dragging state could exist.

In `useCarouselMotion`, the `onTransitionEnd` callback checks `target.classList.contains("scene-default")`. The slot `<div>` elements in `Carousel.tsx` do not have the class `"scene-default"`. If the child `<Scene />` component also lacks this class, `carouselStore.setPosition(id)` is never called via the transition-end path, meaning `index` never advances after a commit animation completes.

`buildContext` converts dataset values with `Number()` without `NaN` checks. Non-numeric strings in `data-snapX`, `data-snapY`, `data-lockPrevAt`, or `data-lockNextAt` produce `NaN` that propagates silently through solver math.

Gesture map eviction in `interpreter.onDown` is FIFO-like — it evicts the first PENDING gesture or the absolute first gesture. In rapid multi-touch, eviction could discard a gesture still tracked by its `pointerBridge` instance, leaving that bridge in `isActive: true` with no corresponding interpreter state.

`buildDesc` silently returns `null` for uninitialized stores. If a pointer event hits an element before its `use[X]Store` hook has called `store.init(id)`, the event is dropped with no signal.

Solvers trust that descriptor data (sizes, positions, constraints) are valid numbers. `sliderUtils.resolveStart` computes `(mainOffset - mainThumbSize / 2) / usable` — if `usable` is zero (e.g., track size equals thumb size), this produces `Infinity` or `NaN`.

On the positive side, `pointerBridge` handles `pointercancel` cleanly via `pipeline.abortGesture`, and pointer capture (`setPointerCapture` / `releasePointerCapture`) is wrapped in try/catch.

### 7. Performance — 7/10

The hot path (pointer move → pipeline → solver → store → DOM update) is lean and synchronous with no unnecessary allocations beyond the expected Zustand state updates.

Each primitive instance creates its own `ResizeObserver`. With many interactive elements on screen, this means many independent observers. Modern browsers handle multiple observers efficiently, but a shared observer with per-element callbacks would reduce overhead at scale.

During active dragging, every pointer move triggers a store update (`offset` in carousel/drag, `value` in slider), which causes `useShallow` to detect a change and re-render. The motion hooks use `useMemo` to avoid unnecessary style object allocation, which mitigates cost. However, there is no coalescing — if pointer events arrive faster than React's render cycle, multiple store updates queue before a single render.

`Object.keys(gestures).length` in `interpreter.onDown` creates a temporary array on every pointer down just to check a count. A simple counter variable would avoid this allocation.

`document.elementsFromPoint` is called on every pointer down and also during lane re-resolution in `onMove` via `domQuery.findLaneInDom`. This DOM query is fast in shallow DOMs but proportional to element count at the hit point.

`carouselStore.setPosition` schedules a `requestAnimationFrame` to clear `settling`. If called rapidly (e.g., fast carousel commits), multiple RAFs queue. Each checks `if (!s) return`, so it is safe but produces wasted callbacks.

### 8. Testability — 7/10

The architecture's layering enables good isolation for most modules, with friction concentrated in the singleton and DOM-dependent layers.

Solvers and solver utils (`carouselSolver`, `dragSolver`, `sliderSolver`, `vectorUtils`, `axisUtils`, `carouselUtils`, `dragUtils`, `sliderUtils`) are all pure functions or stateless objects taking data in and returning data out. These can be tested with simple mock descriptors and no DOM or React environment.

`interpreter` has module-level mutable state in the `gestures: GestureMap` singleton. There is a `deleteGesture` method but no `reset()` or `clearAll()` function, meaning test cleanup requires manually deleting each gesture or reloading the module. Cross-test contamination is a risk.

`pipeline` imports `interpreter`, all three solvers, all three stores, and `domUpdater` at module level. Testing it in isolation requires either a fully wired environment or module-level mocking.

`domQuery` requires a DOM — `findTargetInDom` and `findLaneInDom` call `document.elementsFromPoint`, and `resolveElOffsetInDom` calls `element.getBoundingClientRect()`. These are untestable without jsdom or a browser.

`buildDesc` couples to Zustand store singletons. Tests must pre-populate store state via `store.getState().init(id)` and set values before calling `resolveFromElement`, creating implicit setup requirements.

`sizeStore` reads `window.__DEVICE` and `window.innerWidth/Height` at import time. This module-level side effect means test environment setup must occur before the module is imported.

React components use standard hooks and render HTML with `data-*` attributes, making them structurally compatible with React Testing Library. However, simulating the full gesture lifecycle (pointer down → move → up) through DOM events requires careful event simulation that exercises the entire pipeline.

### 9. Dead or Redundant Code — 6/10

`Reactions.modifiable` is computed in `buildReactions` in `buildDesc.ts` based on `data-modifiable`, `data-snapX`, `data-snapY`, `data-lockPrevAt`, `data-lockNextAt`, and `data-locked`. No code anywhere in the pipeline, solvers, or stores ever reads `reactions.modifiable`. The snap and lock logic is instead handled directly via `DomContext` fields and descriptor data.

`useCarouselMotion`'s `onTransitionEnd` callback checks `target.classList.contains("scene-default")`, but `Carousel.tsx` never assigns `"scene-default"` to the slot wrapper divs. If this guard never passes, the callback is effectively dead code — or worse, it is a bug preventing index advancement.

`GestureUpdate` in `dataType.ts` is slider-specific (fields: `sliderStartOffset`, `sliderValuePerPixel`) but is defined in shared types with a generic name. It is only constructed by `sliderSolver`, only applied by `interpreter.applyGestureUpdate` (which switches on `desc.type === 'slider'`), and only consumed by `sliderUtils.resolveSwipe`.

`Normalized1D.mainThumbSize` and `crossThumbSize` in `ctxType.ts` are only populated by `sliderUtils.normalize`. Carousel and drag normalization paths never set them, making these fields slider-specific within a shared type.

`carouselUtils.normalize` and `sliderUtils.normalize` share a nearly identical structure: both call `normalizeBase(desc.base, desc.ctx.delta)` then add `mainSize`/`crossSize` from their respective size data. This is duplicated structure.

`buildReactions` checks for `ds.swipe` and `ds.modifiable` attributes, but no current component sets `data-swipe` or `data-modifiable`. These checks appear to exist for future use or are remnants of removed functionality.

`BASE_STYLE` in `useSliderMotion` defines `{ willChange: "transform" }` and spreads it into every thumb style. Neither `useCarouselMotion` nor `useDragMotion` use `willChange`, making this an inconsistency as well as potentially unnecessary.

### 10. Scalability — 7/10

Adding a new primitive requires edits in approximately 10 locations: new union member in `InteractionType`, new `CtxX` in `ctxType.ts`, new `XDesc` in `descriptor.ts`, new solver file, new store file, new `buildX` methods in `buildDesc.ts`, new event set in `pipelineType.ts`, new branch in `pipeline.ts`'s switch statement, new component with its hooks, and a new entry in `Interactive.tsx`. The pattern is clear and repeatable, but there is no codegen or registry — all wiring is manual.

`pipeline.ts`'s switch statement is the central coupling point. Every primitive adds a branch. This is manageable at 4 types but would become unwieldy at 8+. A dispatch table pattern (keyed by type, resolving solver + store + event set) could reduce this coupling but would sacrifice the explicit type narrowing the switch currently provides.

`buildDesc` grows linearly with primitive count — each primitive adds a new `buildXData` method and a new store import.

Pointer event throughput is single-threaded and synchronous through the full pipeline. For normal touch interaction this is entirely adequate, but a scenario with many simultaneous active primitives serializes all processing through the same `pipeline.orchestrate` call.

On the positive side, `pipelineType.ts`'s `EVENT_MAP` with `satisfies Record<DataKeys, EventType[]>` catches missing type entries at compile time. The module boundaries also support team scalability — developers can work on solvers without touching components, and vice versa. The convergence points where changes collide are `pipeline.ts` and `buildDesc.ts`.
