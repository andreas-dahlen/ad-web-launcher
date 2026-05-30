# Analysis Report — Interaction & Components System

## Overview
The interaction + components system is a well-architected, purpose-built gesture engine with clean layering, properly scoped Zustand stores, and pure testable solvers. Since the first report (5.5/10 on 04-05), substantial improvements have been made: unsafe `as` casts at the DOM boundary replaced with `toAxis()`/`toType()` validators, the `Reactions` type renamed to the clearer `Capabilities`, `DomMeta` replacing the overloaded "context" naming, `DragCtxPartial` fixed to include `delta`, store `get()` methods properly returning `| null`, and dead state like `Slider.offset` cleaned up. The remaining findings are predominantly consciously deferred tickets where the developer has made well-reasoned trade-offs appropriate for a launcher app's scale. The genuine remaining weaknesses are: commented-out code in `carouselStore` and `useSliderMotion`, the potentially dead `data-swipe` check in `buildCapabilities`, a division edge case in `sliderUtils.resolveStart`, and the continued absence of tests blocking several testability improvements. The system is healthy, coherent, and improving — the 7/10 ceiling reflects a mature codebase where most remaining issues are conscious deferrals rather than defects.

## Overall Score: 7/10

---

## Findings

### 1. Type Safety — 7.5/10

The type system is meaningfully stronger than prior reports. All `any` usage remains absent. The discriminated union pattern (`Descriptor`, `CtxType`) enables clean narrowing throughout the pipeline. `toAxis()` and `toType()` in `primitiveType.ts` provide proper runtime validation at the DOM boundary, eliminating the unsafe `as Axis` casts reported on 04-05. `DragCtxPartial` now correctly includes `storeAccepted` and `delta`, fixing the drift noted on 04-07. `buildDesc` methods guard store lookup with `?? null` rather than the `!` operator.

`CarouselCtxPartial` in `ctxType.ts` is `Partial<Pick<CtxCarousel, 'delta1D' | 'direction' | 'storeAccepted' | 'event'>>`. The `event` field is now included — this is an improvement over 04-09 when `event` was not in the partial pick and was being spread silently through excess property leniency.

Solver types remain `Partial<Record<EventType, ...>>`. The developer has consciously retained this — `Partial` is intentional since some events (like `swipeRevert` for carousel) need no solver handler. The optional chaining in `pipeline.ts` (`fn?.(ctx)`) correctly handles missing keys at runtime. The trade-off is that adding a handler for a wrong event type won't produce a compile error.

`pipeline.ts` still uses `ctx.event as keyof CarouselFunctions` (and equivalents for slider/drag). The runtime guard via `CAROUSEL_EVENTS.has()` precedes the cast, so invalid keys never reach the store. The cast is confined to one location per primitive.

`GestureMap` in `interpreter.ts` is typed as `Partial<Record<number, GestureState>>`. The `Partial` wrapper means `gestures[pointerId]` is correctly typed as `GestureState | undefined`, and every usage guards with `if (!g) return null`.

`Normalized1D` has all-optional fields. Every consumer null-checks correctly. The `axis === 'both'` path returns `{}` intentionally, which motivates the all-optional design.

`domMeta.ts` uses `parseNumber()` which returns `null` for `NaN` — this is a clean boundary check preventing `NaN` from leaking into the system through `data-*` attributes.

Both `carouselStore.get()` and `sliderStore.get()` now correctly declare `| null` in their return types, matching the runtime `?? null` behavior.

### 2. State Management — 8/10

Store architecture remains strong. Each primitive owns its own Zustand store (`carouselStore`, `dragStore`, `sliderStore`) with immer middleware, and the global `sizeStore` handles viewport normalization independently. The `bindings: Record<string, T>` pattern allows multiple instances keyed by `id`. No cross-store coupling exists at the store layer — the only place multiple stores are read together is `buildDesc.ts`, which is the designated descriptor assembly phase.

The `requestAnimationFrame` inside `carouselStore.setPosition()` (flagged in all prior reports) is now commented out. The active `swipeStart` method handles index advancement synchronously when `pendingDir !== null`. The rAF side-effect concern inside a store has been eliminated.

Subscription granularity: each `use[X]Store` hook subscribes to the full binding via `useShallow(s => s.bindings[id] ?? DEFAULTS)`. For carousel, `settling` is actually consumed by `useCarouselMotion` for transition control — so the subscription is justified. `pendingDir` changes are infrequent (only on commit). For drag, `minX`/`maxX`/`minY`/`maxY` change only on mount via ResizeObserver — not a practical re-render concern. The developer has consciously retained this design.

`sliderStore` no longer has a dead `offset` field (previously flagged in 04-09). The slider store shape is now `{ value, min, max, size, thumbSize, dragging }` — all fields are used.

Store `init` methods are idempotent (`if (get().bindings[id]) return`), preventing double-initialization on React strict mode. Store `delete` is called in `use[X]Store` cleanup effects.

Immer on every swipe frame is a latent concern at scale. During active drag at 60fps, each `pointermove` triggers immer's proxy-based `set()`. For a launcher app with typically one active gesture, this is acceptable. Would become measurable with many simultaneous drag targets.

`sizeStore` exports free functions (`getAxisSize`, `normalizeParameter`) that call `getState()` synchronously, providing a clean pattern for imperative code to access global sizing without React subscriptions.

### 3. Separation of Concerns — 7.5/10

The pipeline layering is clean: `pointerBridge` → `pipeline` → `interpreter` → `solver` → `store` → `domUpdater`. Each module has a clear primary responsibility.

`buildDesc.ts` reads from all three stores via `getState().get(id)`. This is the designated context-assembly phase — the descriptor factory needs store data to populate `CarouselData`, `SliderData`, `DragData`. The coupling is appropriate for its role. However, it means `buildDesc` has explicit knowledge of all three store shapes and grows with each new primitive.

A circular dependency exists between `domQuery.ts` and `buildDesc.ts`: `domQuery` imports `buildDesc` for descriptor resolution, and `buildDesc` imports `domQuery` for `resolveElOffsetInDom`. JavaScript module resolution handles this at runtime, but it creates a conceptual cycle where the "find element" and "build descriptor" modules depend on each other.

`interpreter.ts` calls `domQuery.findLaneInDom()` during the PENDING→SWIPING transition for lane reassignment. This mixes gesture state management with DOM resolution, but the operation (resolve new target during phase transition) is cohesive enough that splitting it would create indirection without benefit.

`gestureUtils.ts` is a mixed utility file (4 functions: `normalizedDelta`, `resolveAxis`, `swipeThresholdCalc`, `isSwipeableDescriptor`). The developer has consciously retained this — the functions are consumed together in `interpreter.ts` and the file is small. `gestureUtils` imports `normalizeParameter` and `getAxisSize` from `sizeStore.ts`, making utility functions dependent on store state — a minor coupling.

`domUpdater.ts` is cleanly scoped to DOM attribute writing and event dispatch. `handleExtras()` for press cancellation is a contained concern within it.

`pipeline.orchestrate()` is a legitimate orchestrator — the switch/case structure keeps each type's wiring co-located and each branch is ~10 lines.

### 4. Naming & Discoverability — 7/10

Naming has improved substantially since earlier reports. The "context" overload is resolved — `DomMeta` / `extractDomMeta` (formerly `Context` / `buildContext`) is now distinct from `CtxType` / `CtxCarousel`. The `Reactions` type was renamed to `Capabilities` with `pressable` / `swipeable` fields.

File naming across primitives is excellent and consistent: `xSolver.ts`, `xStore.ts`, `xUtils.ts`, `useXMotion.ts`, `useXSizing.ts`, `useXStore.ts`. A developer can navigate by pattern.

`delta1D` on `CtxCarousel` and `CtxSlider` represents different things: pixel offset for carousel, logical value for slider. The developer has consciously retained this name, arguing it clearly communicates "a 1D delta number." The semantic difference per primitive is a real concern but understood within the team.

`GestureUpdate` in `dataType.ts` is slider-specific (fields: `sliderStartOffset`, `sliderValuePerPixel`). The `slider` prefix on the fields makes scope obvious. The developer has consciously retained its location in shared types.

`Normalized1D` is a non-obvious name for an axis-decomposed measurement bundle with main/cross components for position, delta, and size. Used consistently in all solver utils.

`vector` (the export name in `vectorUtils.ts`) could be confused with a mathematical vector library. It's actually an axis-decomposition and clamping utility.

The `data-*` attribute contract remains undocumented by choice. The developer argues that `propsType.ts` serves as de-facto documentation since each prop maps to a `data-*` attribute.

`APP_SETTINGS.hysteresis` has a confusing comment ("gitter removal for gating to remove gitters"). The value itself is used correctly in `exceedsCrossRange()` for cross-axis gating.

### 5. Consistency Across Primitives — 7.5/10

The three swipeable primitives follow the same architectural skeleton with intentional, well-motivated asymmetries.

Solver event handler sets differ by design: carousel handles `{swipe, swipeStart, swipeCommit}` and produces `swipeRevert` (via `event` override in solver return); slider handles `{press, swipeStart, swipe, swipeCommit}` (tap-to-position); drag handles `{swipeStart, swipe, swipeCommit}`. The `EVENT_MAP` in `pipelineType.ts` documents these per-primitive event sets. The `Partial<Record<EventType, ...>>` solver type reflects the intentional variation.

Motion hook return shapes differ: `useCarouselMotion` returns `{ styleForRole }` (a function for role-mapped styling across 3 slots), while `useDragMotion` returns `{ itemStyle }` and `useSliderMotion` returns `{ thumbStyle }` (both memoized objects). The carousel's multi-slot rendering necessitates the function pattern.

Sizing hooks have different signatures reflecting different measurement needs: `useCarouselSizing` takes `{ elRef, axis, id }` and observes 1 element, `useDragSizing` takes `{ elRef, containerRef, id }` and observes 2, `useSliderSizing` takes `{ elRef, thumbRef, id }` and observes 2. The different signatures map to genuine structural differences.

Store shapes diverge because domain concepts differ: carousel has `{ index, offset, count, size, dragging, settling, pendingDir }`, slider has `{ value, min, max, size, thumbSize, dragging }`, drag has `{ offset, dragging, position, minX, maxX, minY, maxY }`. Constraint representation is flat in drag (`minX`, `maxX`, etc.) versus nested in slider (`{ min, max }`). The developer has consciously retained this, arguing the concepts are genuinely different.

`useAugmentedScenes` is carousel-specific, handling mirror scenes for non-interactive carousels. No equivalent exists for other primitives — this is a genuine carousel-only concern.

Slider's `onReaction` handler in `Slider.tsx` is thicker than Carousel and Drag's — it inverts value for vertical axis and deduplicates via `lastEmitted` ref. This added complexity reflects the slider's richer event surface (3 reactive event types vs 1 for carousel/drag).

Data attribute patterns: the `data-react-*` prefix for reaction controls is applied consistently to each primitive's relevant events. Button uses `data-react-press`/`data-react-press-release`/`data-react-press-cancel`, Slider uses `data-react-swipe`/`data-react-swipe-start`/`data-react-swipe-commit`, Carousel and Drag use `data-react-swipe-commit`.

### 6. Error Handling & Edge Cases — 6.5/10

Error handling covers the main paths but has known gaps at the edges.

Gesture map overflow in `interpreter.onDown()` is handled with targeted eviction: it finds the first `PENDING` gesture to evict, falling back to the absolute first entry. This evicts one gesture, not all — an improvement over the "clears ALL gestures" approach flagged in 04-09.

`pointerBridge.ts` handles `pointercancel` cleanly via `pipeline.abortGesture(e.pointerId)`, explicitly aborting the gesture rather than treating it as `pointerup`.

Bridge cleanup on `disabled` change: the effect watches `disabled` and calls `pipeline.abortGesture` plus releases pointer capture. Bridge cleanup on unmount: the `useEffect` cleanup aborts any active gesture and removes all listeners. Both cases handle mid-gesture interruption.

Store bindings can be deleted by `use[X]Store` cleanup while the pipeline holds a descriptor referencing that `id`. If a pointer event races with unmount, `buildDesc.buildXData()` returns `null`, and the pipeline drops the event silently. No crash, but the user's gesture is lost without feedback.

`sliderUtils.resolveStart` computes `(mainOffset - mainThumbSize / 2) / usable`. If `usable` is 0 (track size equals thumb size), division produces `Infinity`. The subsequent `vector.clamp(ratio, 0, 1)` clamps `Infinity` to `1`, producing `max` as the value. Technically safe but semantically incorrect — a zero-usable slider should probably be inert.

`buildDesc.buildCapabilities` checks `ds.locked !== 'true'` for swipeability. This is consistent with `domMeta.ts` where `locked` is set via `ds.locked === 'true'`. Strict equality prevents strings like `"yes"` from being misinterpreted.

No validation of `id` uniqueness across component instances. Two components sharing the same `id` silently read/write the same store binding.

`buildDesc` silently returns `null` for uninitialized stores. If a pointer event hits an element before `use[X]Store` has called `store.init(id)`, the event is dropped with no signal.

`exceedsCrossRange()` in `axisUtils.ts` rejects silently when a swipe exceeds the hysteresis boundary, returning `{ storeAccepted: false }` with no debug logging.

`interpreter.onMove()` can leave a gesture in PENDING state indefinitely if `isSwipeableDescriptor` returns `false` and `findLaneInDom` also returns `null`. The gesture stays PENDING until `onUp`, which triggers `pressRelease` — potentially semantically wrong for a non-pressable element, though `finalizeGesture` correctly checks `capabilities.pressable` and drops the gesture if false.

### 7. Performance — 7.5/10

The hot path (pointer move → pipeline → solver → store → DOM update) is lean and synchronous.

`Object.keys(gestures).length > 10` in `interpreter.onDown()` allocates a temporary array per pointer down. The developer has consciously retained this, arguing ~10 gestures max in a launcher makes it negligible.

Immer on every swipe frame remains the biggest latent bottleneck. Each `pointermove` → store `set(produce(...))`. At one gesture this is imperceptible. At many simultaneous gestures it could compound.

Store size-setters have equality guards: `carouselStore.setSize()` checks `if (s.size.x === trackSize.x && s.size.y === trackSize.y) return`. `sliderStore.setSize()` performs the same check. `sliderStore.setThumbSize()` also guards. `dragStore.setConstraints()` uses per-field undefined checks. ResizeObserver callbacks are guarded against no-op updates across all three primitives.

No ResizeObserver debouncing. Callbacks fire on every layout change and directly call store setters. Since the setters have equality guards, repeated identical values don't trigger re-renders.

`useCarouselMotion`'s `styleForRole` callback recomputes on every delta change during drag — `useCallback` depends on `[translate, axisSize, delta, transition]`. During active drag, `delta` changes every frame. This is expected — the function must return new styles for new positions.

Per-component `ResizeObserver` instances. The developer has consciously retained independent observers rather than pooling. At launcher scale this is fine.

`normalizedDelta()` on every move calls `sizeStore.getState().normalizeParameter()` twice per frame (for x and y). Minimal overhead individually but non-zero.

`document.elementsFromPoint` is called on pointer down and during lane re-resolution in `onMove` via `domQuery.findLaneInDom`. This DOM query is fast in shallow DOMs.

### 8. Testability — 7/10

The solver layer is highly testable. The pipeline integration layer is harder to test in isolation.

Solvers and solver utils (`carouselSolver`, `dragSolver`, `sliderSolver`, `vectorUtils`, `axisUtils`, `carouselUtils`, `dragUtils`, `sliderUtils`) are all pure functions or stateless objects taking data in and returning data out. Ideal unit test targets with no DOM or React dependency.

`interpreter.ts` has module-level mutable state (`gestures`). The developer has deferred adding `reset()` since no tests exist yet — valid reasoning that becomes actionable when test authoring begins.

`buildDesc` reads from stores directly. Testing requires pre-populating store state via `store.getState().init(id)` followed by setter calls. Workable but creates implicit setup requirements.

`domQuery` requires a DOM (`document.elementsFromPoint`, `element.getBoundingClientRect()`). Untestable without jsdom or a browser.

`pipeline.orchestrate()` imports interpreter, all solvers, all stores, and `domUpdater`. Testing requires either full module wiring or extensive mocking. No dependency injection mechanism exists.

Zustand stores test well standalone: `store.getState().init('test')` → mutate → assert is idiomatic.

`domUpdater` is easily testable — takes `CtxType`, mutates `HTMLElement`, dispatches custom events. Simple mock elements work.

`sizeStore` reads `window.__DEVICE` and `window.innerWidth/Height` at import time. Module-level side effect means test environment setup must precede module import.

React components use standard hooks and render HTML with `data-*` attributes, structurally compatible with React Testing Library. Full gesture lifecycle simulation (pointer down → move → up) requires careful event simulation through the entire pipeline.

### 9. Dead or Redundant Code — 7.5/10

The codebase has been cleaned up compared to earlier reports. Several previously flagged items are resolved.

`carouselStore.setPosition` (lines 75-91) is commented out. The active `swipeStart` method now handles index advancement when `pendingDir !== null`. The commented method is a historical artifact that should be removed.

`useSliderMotion` has a commented-out `BASE_STYLE` const (lines 14-16 with `willChange: "transform"`). Dead commented code.

`buildCapabilities` in `buildDesc.ts` checks `ds.swipe !== undefined`. No current component sets `data-swipe` on its elements — `Carousel.tsx`, `Drag.tsx`, and `Slider.tsx` all use `data-react-swipe` or `data-react-swipe-commit` instead. The `data-swipe` check may be intended as a public API surface for enabling swipeability without React reactivity, or it may be a remnant. The developer has flagged this as needing investigation (//HELP in RECOMMENDATIONS).

`Normalized1D.mainThumbSize` and `crossThumbSize` in `ctxType.ts` are only populated by `sliderUtils.normalize`. Carousel and drag normalization paths never set them. This makes `Normalized1D` wider than necessary for non-slider consumers, though having one shared type simplifies `exceedsCrossRange()`.

`carouselUtils.normalize` and `sliderUtils.normalize` share an identical opening structure: call `normalizeBase(desc.base, desc.ctx.delta)` then add `mainSize`/`crossSize`. The developer has consciously retained this duplication, arguing the functions diverge enough (slider adds thumb sizes) that extraction adds indirection for ~3 shared lines.

The sizing hook pattern (create ResizeObserver → observe → measure → store set → disconnect) is duplicated across `useCarouselSizing`, `useDragSizing`, and `useSliderSizing`. The developer has consciously retained this, noting each hook observes different element counts and calls different store setters.

`APP_SETTINGS.hysteresis` has a confusing comment ("gitter removal for gating to remove gitters") — the comment is effectively dead documentation that obscures rather than clarifies.

### 10. Scalability — 7/10

The pattern is clear and repeatable. Adding a new primitive requires changes in ~10 locations, all following established patterns.

Required touchpoints for a new primitive: new union member in `InteractionType` (`primitiveType.ts`), new `CtxX` (`ctxType.ts`), new `XDesc` and union member (`descriptor.ts`), new data types (`dataType.ts`), new event set (`pipelineType.ts`), new builder methods (`buildDesc.ts`), new pipeline case (`pipeline.ts`), new solver + utils, new store, new component with hooks, and `Interactive.tsx` entry. No codegen or registry — all manual.

`buildDesc.ts` is the highest-surface-area file for new primitives — it needs new `buildX`, `buildXData`, `buildXCtx` methods. At 4 primitives (~170 lines) it's manageable. At 8+ it would warrant splitting.

Pipeline's switch/case grows linearly. Each primitive adds ~10 lines. The structure is clear but mechanical.

The discriminated union pattern (`Descriptor`, `CtxType`) scales well — TypeScript exhaustiveness checking ensures all switch branches are handled when a new variant is added.

Module-level singleton state in `interpreter.ts` (`gestures` map) prevents multiple interpreter instances. Not a problem for a single launcher app but blocks SSR or parallel testing.

Single-threaded synchronous event processing in `pipeline.orchestrate()`. At very high pointer event volume this is serial through one function — adequate for launcher workloads, would need rethinking for high-frequency multi-touch applications.

The `use[X]Store` / `use[X]Sizing` / `use[X]Motion` hook pattern is repeated from scratch per primitive. Adding a primitive means reimplementing these patterns rather than composing from shared building blocks. The developer has consciously retained this, arguing the hooks are simple and different enough that abstraction adds indirection without benefit at current scale.
