# System Context — Interaction & Components System

**Project snapshot:** April 5, 2026
**Status:** See ANALYSIS_REPORT.md for scored findings. See RECOMMENDATIONS.md for prioritised improvements.

> This document reflects the codebase as of the timestamp above. If changes have been made since, treat details as potentially stale.

---

## What This System Does

A custom gesture-handling pipeline intercepts raw pointer events on DOM elements, classifies them into interaction types (button, carousel, slider, drag), and routes them through an interpreter → solver → state mutation → render cycle. The interpreter tracks per-pointer gesture state (pending vs swiping) and builds typed descriptors by reading `data-*` attributes from the DOM and snapshotting Zustand store values. Solvers are pure functions that compute context patches (deltas, directions, commit/revert decisions) without touching DOM or state. The pipeline dispatches solved contexts to the appropriate Zustand store methods, which update reactive state. React components subscribe to their store slice and convert state into CSS `transform` styles via motion hooks — keeping the render layer purely declarative and decoupled from imperative gesture logic. A renderer module also applies DOM attributes (`data-pressed`, `data-swiping`) and fires `CustomEvent('reaction')` back to elements for callback plumbing.

---

## Directory Map

### `interaction/`

| File | Purpose |
|------|---------|
| `bridge/bridge.ts` | React hook `usePointerForwarding` — attaches `pointerdown/move/up/cancel` listeners to an element ref and forwards events as `PointerEventPackage` to `pipeline.orchestrate`. Manages pointer capture and active gesture lifecycle per element. Also listens for `CustomEvent('reaction')` and forwards to an `onReaction` callback. |
| `core/pipeline.ts` | Central orchestrator. `pipeline.orchestrate(desc)` routes through interpreter → solver → store → renderer. `pipeline.abortGesture(pointerId)` cleans up a gesture. Contains `interpreterMap`, `solverRegistry`. |
| `core/interpreter.ts` | Stateful gesture tracker. Maintains a module-level `gestures: Record<number, GestureState>` map keyed by pointerId. Exports `onDown`, `onMove`, `onUp`, `applyGestureUpdate`, `deleteGesture`. Manages PENDING→SWIPING phase transitions, swipe threshold detection, lane fallback on swipe start, and gesture finalization. |
| `core/buildDesc.ts` | Descriptor factory. `buildDesc.resolveFromElement(el, x, y, pointerId)` reads DOM context + store snapshots and constructs a typed `Descriptor`. Contains per-type builders (`buildCarousel`, `buildSlider`, `buildDrag`, `buildButton`) and sub-builders for base, data, and ctx sections. Also exports `buildReactions` for determining pressable/swipeable/modifiable flags from `data-*` attributes. |
| `core/domQuery.ts` | DOM hit-testing. `findTargetInDom(x, y, pointerId)` calls `document.elementsFromPoint` and returns the first eligible `Descriptor`. `findLaneInDom(x, y, inputAxis, pointerId)` finds a swipeable lane matching the given axis (used for lane fallback). `resolveElOffsetInDom(x, y, element)` computes pointer offset within element bounds. |
| `core/intentUtils.ts` | Utility grab-bag. `buildContext(el)` reads `data-*` attributes into a `Context` object. `resolveAxis`, `swipeThresholdCalc`, `resolveTarget`, `resolveSwipeStart`, `resolveCancel`, `resolveSupports`, `normalizedDelta`. Contains gesture policy logic (thresholds, lane fallback). |
| `solvers/carouselSolver.ts` | Pure solver. Handles `swipeStart` (accept), `swipe` (1D delta + gate + lock check), `swipeCommit` (commit vs revert decision based on threshold). Returns `CtxPartial`. |
| `solvers/sliderSolver.ts` | Pure solver. Handles `press` (tap-to-position), `swipeStart` (compute initial value + gestureUpdate), `swipe` (value from pixel delta), `swipeCommit` (same as swipe). Returns `CtxPartial`. Unique: returns `gestureUpdate` which feeds back into interpreter. |
| `solvers/dragSolver.ts` | Pure solver. Handles `swipeStart` (accept), `swipe` (2D constrained delta), `swipeCommit` (clamped position + optional snap + direction). Returns `CtxPartial`. |
| `solvers/solverUtils.ts` | Shared + per-primitive solver math. `normalize1D(desc)` projects Vec2 delta/size onto the descriptor's axis. `resolveGate(norm)` checks cross-axis hysteresis. Carousel-specific: `isCarouselBlocked`, `resolveCarouselCommit`, `shouldCommit`, `getCommitOffset`. Slider-specific: `resolveSliderStart`, `resolveSliderSwipe`. Drag-specific: `resolveDragSwipe`, `resolveDragCommit`, `resolveSnapAdjustment`, `resolveDragDirection`. |
| `solvers/vectorUtils.ts` | Pure vector math. `clamp`, `clamp2D`, `relativeClamp2D`, `resolveByAxis1D` (project Vec2 → `{prim, sub}` by axis), `resolveDirection` (Vec2/number → Direction). |
| `types/primitiveType.ts` | Foundational type atoms. `Axis`, `Axis1D`, `EventBridgeType` (`'down'|'move'|'up'`), `Direction`, `InteractionType` (`'button'|'carousel'|'slider'|'drag'`), `DataKeys` (InteractionType minus button), `EventType` (`swipeStart|swipe|swipeCommit|swipeRevert|press|pressRelease|pressCancel`), `Vec2`. |
| `types/ctxType.ts` | Pipeline context types. `CtxBase` (event, id, element, stateAccepted). `CtxButton`, `CtxCarousel` (+delta, cancel, delta1D, direction), `CtxSlider` (+delta, cancel, delta1D, gestureUpdate), `CtxDrag` (+delta, cancel). Union `CtxType`. Alias `CtxSwipeType` (excludes button). `CancelData` (element + pressCancel flag). |
| `types/pipelineType.ts` | Pipeline plumbing types. `PointerEventPackage`, `InterpreterFn`, `solverFn`, `SolverMap`, `CtxPartial`, `EventMap`, `CarouselFunctions`, `SliderFunctions`, `DragFunctions`. |
| `types/gestureTypeGuards.ts` | Assertion type guards. `descIs<T>`, `isCarousel`, `isDrag`, `isSlider`, `isButton`, `isGestureType`. In production (VITE_DEBUG !== 'true'), mismatches `console.warn` instead of throwing. |
| `types/descriptor/baseType.ts` | Descriptor base types. `BaseInteraction` (pointerId, element, id, actionId?). `BaseWithSwipe` (adds axis, baseOffset). `Reactions` (pressable, swipeable, modifiable). `Context` (el, ds, id, axis, type, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked). |
| `types/descriptor/dataType.ts` | Per-primitive data snapshots. `CarouselData` (index, size). `CarouselModifiers` (lockSwipeAt). `DragData` (position, constraints). `DragModifiers` (snap?, locked?). `SliderData` (thumbSize, constraints, size). `GestureUpdate` (pointerId, sliderStartOffset?, sliderValuePerPixel?). |
| `types/descriptor/descriptor.ts` | Discriminated descriptor union. `CarouselDesc` = {base: BaseWithSwipe, data: CarouselData & CarouselModifiers, reactions, ctx: CtxCarousel}. `SliderDesc`, `DragDesc`, `ButtonDesc` analogous. `Descriptor` = union of `{type: 'carousel'} & CarouselDesc | ...`. |
| `updater/renderer.ts` | DOM attribute writer + event dispatcher. `render.handle(ctx)` applies `data-pressed`/`data-swiping` attributes via `typeHandlers` map, dispatches `CustomEvent('reaction', {detail: ctx})`. `handleExtras` processes `pressCancel` on the original press element when a swipe starts on a different lane. |
| `zunstand/carouselState.ts` | Zustand store (immer). Shape per id: `{index, offset, count, size, dragging, settling, pendingDir}`. Methods: `init`, `get`, `setCount`, `setSize`, `setPosition` (commits index from pendingDir + rAF settling reset), `swipeStart`, `swipe`, `swipeCommit`, `swipeRevert`. Helper: `getNextIndex`. |
| `zunstand/dragState.ts` | Zustand store (immer). Shape per id: `{position, offset, dragging, minX, maxX, minY, maxY}`. Methods: `init`, `get`, `setConstraints`, `setPosition`, `swipeStart`, `swipe`, `swipeCommit`. |
| `zunstand/sliderState.ts` | Zustand store (immer). Shape per id: `{value, offset, min, max, size, thumbSize, dragging}`. Methods: `init`, `get`, `setConstraints`, `setSize`, `setThumbSize`, `press`, `swipeStart`, `swipe`, `swipeCommit`. |
| `zunstand/sizeState.ts` | Device/viewport scaling store. Computes `scale`, `scaledWidth`, `scaledHeight` from device dimensions (from `window.__DEVICE` or defaults) vs viewport. Exports `normalizeParameter(px)`, `getAxisSize(axis)`, `useSize()` hook (uses `useShallow`). Used by `intentUtils.normalizedDelta` and `intentUtils.swipeThresholdCalc`. |

### `components/primitives/`

| File | Purpose |
|------|---------|
| `Interactive.tsx` | Union switch component. Takes `InteractiveProps` (discriminated by `type`), renders the matching primitive. No logic — pure routing. |
| `button/Button.tsx` | Button primitive. Renders a `div` with `data-type="button"`, `data-id`, `data-press`, `data-action`, `data-react-*`. Uses `usePointerForwarding`. Exposes `onPress`, `onPressRelease`, `onPressCancel` callbacks gated by `reactPress`/`reactPressRelease`/`reactPressCancel` booleans. |
| `carousel/Carousel.tsx` | Carousel primitive. Renders a 3-slot sliding window (prev/current/next) from a `scenes: ComponentType[]` array. Uses `useCarouselZustand`, `useCarouselSizing`, `useCarouselMotion`, `useAugmentedScenes`, `usePointerForwarding`. Sets `data-type="carousel"`, `data-id`, `data-axis`, `data-lock-prev-at`, `data-lock-next-at`. Exposes `onSwipeCommit`. |
| `carousel/hooks/useCarouselZustand.ts` | Calls `carouselStore.init(id)` (during render), subscribes to `carouselStore[id]` with fallback defaults. |
| `carousel/hooks/useCarouselSizing.ts` | `ResizeObserver` on carousel element → writes `{x: offsetWidth, y: offsetHeight}` to `carouselStore.setSize(id, ...)`. |
| `carousel/hooks/useCarouselMotion.ts` | Computes per-role `transform` styles from offset/dragging/settling, CSS transition string, and `onTransitionEnd` handler that calls `carouselStore.setPosition(id)` to commit index after animation. |
| `carousel/hooks/useCarouselScenes.ts` | **Unused by Carousel.tsx.** Exports `SceneRole` type (consumed elsewhere) and a `useCarouselScenes` hook that computes prev/current/next scene indices. |
| `carousel/hooks/useAugmentedScenes.ts` | Pads `scenes` array with `EmptyPlaceholder` when `interactive=false` and scenes.length < targetLength. |
| `drag/Drag.tsx` | Drag primitive. Renders a container + draggable item. Uses `useDragZustand`, `useDragSizing`, `useDragMotion`, `usePointerForwarding`. Sets `data-type="drag"`, `data-id`, `data-axis="both"`, `data-locked`, `data-snap-x`, `data-snap-y`. Exposes `onSwipeCommit` gated by `reactSwipeCommit` boolean. |
| `drag/hooks/useDragZustand.ts` | Calls `dragStore.init(id)` (during render), subscribes to `dragStore[id]` with fallback defaults. |
| `drag/hooks/useDragSizing.ts` | `ResizeObserver` on item + container → computes constraint bounds (container - item) → writes to `dragStore.setConstraints(id, ...)`. |
| `drag/hooks/useDragMotion.ts` | Computes `transform: translate3d(position + offset)` style with drag/settle transition. |
| `slider/Slider.tsx` | Slider primitive. Renders a track + thumb. Uses `useSliderZustand`, `useSliderSizing`, `useSliderMotion`, `usePointerForwarding`. Sets `data-type="slider"`, `data-id`, `data-axis`, `data-press`, `data-react-swipe`, `data-react-swipe-start`, `data-react-swipe-commit`. Exposes `onVolumeChange` callback. Deduplicates emitted values via `lastEmitted` ref. Inverts value for vertical sliders. |
| `slider/hooks/useSliderZustand.ts` | Calls `sliderStore.init(id)` (during render), subscribes to `sliderStore[id]` with fallback defaults. |
| `slider/hooks/useSliderSizing.ts` | `ResizeObserver` on slider + thumb → writes track size and thumb size to `sliderStore.setSize` and `sliderStore.setThumbSize`. |
| `slider/hooks/useSliderMotion.ts` | Computes thumb `transform` from value/min/max/laneSize/thumbSize with drag transition. |

---

## Data Flow

### Pointer Event → React Render (complete path)

1. **Pointer event fires on DOM element.** The element has `usePointerForwarding` attached via its component. (`bridge/bridge.ts`)

2. **`usePointerForwarding` handler fires.** `handlePointerDown` captures the pointer (`el.setPointerCapture`), sets `isActive`/`activePointerId` refs, calls `pipeline.orchestrate({ eventType: 'down', x, y, pointerId })`. `handlePointerMove`/`handlePointerUp` follow the same pattern for `'move'`/`'up'`. (`bridge/bridge.ts`)

3. **`pipeline.orchestrate` dispatches to interpreter.** Looks up `interpreterMap[eventType]` → calls `interpreter.onDown|onMove|onUp(x, y, pointerId)`. (`core/pipeline.ts`)

4. **Interpreter resolves descriptor.**
   - `onDown`: calls `utils.resolveTarget(x, y, pointerId)` → `domQuery.findTargetInDom` → `document.elementsFromPoint` → iterates elements → `buildDesc.resolveFromElement(el, x, y, pointerId)` → reads `data-*` via `utils.buildContext(el)`, snapshots store data, constructs `Descriptor`. Stores `GestureState` in `gestures[pointerId]` with `phase: 'PENDING'`. Returns descriptor if pressable, else `null`.
   - `onMove` with `PENDING`: checks swipe threshold (`utils.swipeThresholdCalc`). If exceeded, determines intent axis, calls `utils.resolveSwipeStart` (checks axis compatibility, falls back to lane search). Transitions to `phase: 'SWIPING'`, sets `ctx.event = 'swipeStart'`. Returns descriptor.
   - `onMove` with `SWIPING`: computes cumulative delta, normalizes via `utils.normalizedDelta`, sets `ctx.event = 'swipe'`. Returns descriptor.
   - `onUp`: `SWIPING` → `'swipeCommit'`; `PENDING` → `'pressRelease'`. Deletes gesture entry. Returns descriptor.
   (`core/interpreter.ts`, `core/intentUtils.ts`, `core/domQuery.ts`, `core/buildDesc.ts`)

5. **Pipeline runs solver.** For non-button types: looks up `solverRegistry[type][event]` → calls solver function with descriptor → receives `CtxPartial`. Merges into ctx with spread. Special case: if slider returns `gestureUpdate`, calls `interpreter.applyGestureUpdate(gestureUpdate)`. (`core/pipeline.ts`)

6. **Pipeline dispatches to store.** If `ctx.stateAccepted`: switches on `ctx.type`, gets store state, looks up method by event name (e.g., `carouselStore.getState().swipe`), calls it with ctx. Store uses immer to update its state slice. (`core/pipeline.ts` → `zunstand/*State.ts`)

7. **Pipeline calls renderer.** `render.handle(ctx)` applies DOM attributes (`data-pressed`, `data-swiping`), handles `pressCancel` extras, dispatches `CustomEvent('reaction', { detail: ctx })` on the element. (`updater/renderer.ts`)

8. **React component receives update.** Two paths:
   - **Store subscription:** `use*Zustand(id)` hook re-renders the component with new state (offset, position, value, etc.). The `use*Motion` hook computes a new `transform` style via `useMemo`. React applies the style to the DOM.
   - **Reaction callback:** `usePointerForwarding`'s `handleReaction` fires → component's `onReaction` callback checks `event.detail.event` and calls the user-provided callback (`onSwipeCommit`, `onVolumeChange`, etc.).

---

## Key Types & Relationships

### Primitives (`primitiveType.ts`)
- **`Axis`**: `'horizontal' | 'vertical' | 'both'`
- **`Axis1D`**: `'horizontal' | 'vertical'` (excludes 'both')
- **`EventBridgeType`**: `'down' | 'move' | 'up'` — raw pointer event classification
- **`Direction`**: discriminated union `{ axis, dir }` — encodes both axis and direction
- **`InteractionType`**: `'button' | 'carousel' | 'slider' | 'drag'`
- **`DataKeys`**: `Exclude<InteractionType, 'button'>` — types that have data/solver/store
- **`EventType`**: `'swipeStart' | 'swipe' | 'swipeCommit' | 'swipeRevert' | 'press' | 'pressRelease' | 'pressCancel'`
- **`Vec2`**: `{ x: number, y: number }`

### Descriptor Base (`descriptor/baseType.ts`)
- **`BaseInteraction`**: `{ pointerId, element: HTMLElement, id, actionId? }`
- **`BaseWithSwipe`**: `BaseInteraction & { axis: Axis, baseOffset: Vec2 }`
- **`Reactions`**: `{ pressable, swipeable, modifiable }` — computed from `data-*` attributes
- **`Context`**: `{ el, ds: DOMStringMap, id, axis, type, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked }` — intermediate DOM readout, not persisted

### Descriptor Data (`descriptor/dataType.ts`)
- **`CarouselData`**: `{ index, size: Vec2 }`
- **`CarouselModifiers`**: `{ lockSwipeAt?: { prev, next } }`
- **`DragData`**: `{ position: Vec2, constraints: { minX, maxX, minY, maxY } }`
- **`DragModifiers`**: `{ snap?: Vec2, locked?: boolean }`
- **`SliderData`**: `{ thumbSize: Vec2, constraints: { min, max }, size: Vec2 }`
- **`GestureUpdate`**: `{ pointerId, sliderStartOffset?, sliderValuePerPixel? }` — slider-only feedback to interpreter

### Descriptors (`descriptor/descriptor.ts`)
- **`CarouselDesc`**: `{ base: BaseWithSwipe, data: CarouselData & CarouselModifiers, reactions, ctx: CtxCarousel }`
- **`SliderDesc`**: `{ base: BaseWithSwipe, data: SliderData, reactions, ctx: CtxSlider }`
- **`DragDesc`**: `{ base: BaseWithSwipe, data: DragData & DragModifiers, reactions, ctx: CtxDrag }`
- **`ButtonDesc`**: `{ base: BaseInteraction, reactions, ctx: CtxButton }` — no `data` field
- **`Descriptor`**: `({ type: 'carousel' } & CarouselDesc) | ({ type: 'slider' } & SliderDesc) | ({ type: 'drag' } & DragDesc) | ({ type: 'button' } & ButtonDesc)`

Note: `Descriptor.type` and `Descriptor.ctx.type` always hold the same value (duplication).

### Context Types (`ctxType.ts`)
- **`CtxBase`**: `{ event: EventType, id, element: HTMLElement, stateAccepted: boolean }`
- **`CtxButton`**: `CtxBase & { type: 'button' }`
- **`CtxCarousel`**: `CtxBase & { type: 'carousel', delta: Vec2, cancel?, delta1D?, direction? }`
- **`CtxSlider`**: `CtxBase & { type: 'slider', delta: Vec2, cancel?, delta1D?, gestureUpdate? }`
- **`CtxDrag`**: `CtxBase & { type: 'drag', delta: Vec2, cancel? }`
- **`CtxType`**: `CtxCarousel | CtxSlider | CtxDrag | CtxButton`
- **`CtxSwipeType`**: `Exclude<CtxType, CtxButton>`
- **`CancelData`**: `{ element: HTMLElement, pressCancel: boolean }`

### Pipeline Types (`pipelineType.ts`)
- **`PointerEventPackage`**: `{ eventType: EventBridgeType, x, y, pointerId }`
- **`InterpreterFn`**: `(x, y, pointerId) => Descriptor | null`
- **`solverFn`**: `(desc: Descriptor) => CtxPartial` — note: accepts full union, not narrowed
- **`SolverMap`**: `Partial<Record<DataKeys, Partial<Record<EventType, solverFn>>>>`
- **`CtxPartial`**: `Partial<Exclude<CtxSwipeType, CtxButton>>` — flat partial, not discriminated (known issue)
- **`EventMap`**: maps each DataKeys to its valid event tuple
- **`CarouselFunctions`**: `Pick<CarouselStore, 'swipe' | 'swipeStart' | 'swipeCommit' | 'swipeRevert'>`
- **`SliderFunctions`**: `Pick<SliderStore, 'press' | 'swipeStart' | 'swipe' | 'swipeCommit'>`
- **`DragFunctions`**: `Pick<DragStore, 'swipeStart' | 'swipe' | 'swipeCommit'>`

### Store Types
- **`CarouselStore`**: store shape `Record<string, Carousel>` + init/get + setters + event methods (swipeStart, swipe, swipeCommit, swipeRevert)
- **`SliderStore`**: store shape `Record<string, Slider>` + init/get + setters + event methods (press, swipeStart, swipe, swipeCommit)
- **`DragStore`**: store shape `Record<string, Drag>` + init/get + setters + event methods (swipeStart, swipe, swipeCommit)
- **`SizeStore`**: singleton (not per-id). device, scale, scaledWidth, scaledHeight + update, normalizeParameter, getAxisSize

### Interpreter Internal (not exported)
- **`GestureState`**: `{ type: string, pointerId, phase: 'PENDING' | 'SWIPING', start: Vec2, last: Vec2, totalDelta: Vec2, desc: Descriptor }` — module-level `gestures` map keyed by pointerId

---

## Primitive Structure Pattern

Each swipeable primitive (Carousel, Slider, Drag) follows the same layered pattern:

```
Component.tsx
├── use*Zustand(id)      → subscribes to store, triggers init
├── use*Sizing(refs, id) → ResizeObserver → writes dimensions to store
├── use*Motion(state)    → useMemo → CSS transform style object
├── usePointerForwarding → attaches pointer listeners, calls pipeline
└── JSX                  → data-type, data-id, data-axis, data-* modifiers
```

**Store per primitive:** Each has a Zustand store with immer middleware, keyed by `id: string`. Stores hold reactive state (position/value/offset), sizing data, and expose event methods matching `EventType` names.

**Solver per primitive:** Pure `Partial<Record<EventType, (desc) => CtxPartial>>`. Registered in `pipeline.ts` `solverRegistry`.

### Asymmetries

| Aspect | Carousel | Slider | Drag |
|--------|----------|--------|------|
| **Axis** | `horizontal \| vertical` (1D) | `horizontal \| vertical` (1D) | `both` (always 2D) |
| **State value name** | `index` (integer) | `value` (continuous) | `position` (Vec2) |
| **Live drag field** | `offset` (number) | value updates directly | `offset` (Vec2) |
| **Has revert?** | Yes (`swipeRevert`) | No | No |
| **Has `press` solver?** | No | Yes (tap-to-position) | No |
| **gestureUpdate feedback?** | No | Yes (feeds sliderStartOffset/valuePerPixel back to interpreter) | No |
| **Commit callback prop** | `onSwipeCommit` | `onVolumeChange` (domain-specific name) | `onSwipeCommit` (gated by `reactSwipeCommit` boolean) |
| **Sizing observes** | carousel element | slider + thumb child | item + container |
| **Scenes / children** | `scenes: ComponentType[]` (3-slot window) | `children` (thumb content) | `children` (drag item content) |
| **Data attributes for modifiers** | `data-lock-prev-at`, `data-lock-next-at` | `data-react-swipe`, `data-react-swipe-start`, `data-react-swipe-commit` | `data-snap-x`, `data-snap-y`, `data-locked` |

Button is structurally different: no solver, no store, no sizing/motion hooks, no swipe — press/release only.

---

## Conventions & Patterns

### Data Attributes
All interaction metadata is communicated from React → interaction system via `data-*` attributes on DOM elements:
- **`data-type`**: `InteractionType` — identifies the primitive kind
- **`data-id`**: string — unique primitive instance identifier, used as store key
- **`data-axis`**: `Axis` — swipe axis constraint
- **`data-press`**: presence = element is pressable
- **`data-action`**: string — button action identifier (buttons only)
- **`data-swipe`**: presence = element is swipeable (alternative to axis-based detection)
- **`data-react-press`**, **`data-react-swipe`**, etc.: presence = React callback should fire for this event
- **`data-locked`**: `'true'` = swipe disabled for this element
- **`data-snap-x`**, **`data-snap-y`**: grid snap counts (drag only)
- **`data-lock-prev-at`**, **`data-lock-next-at`**: carousel lock indices
- **`data-pressed`**, **`data-swiping`**: set/removed by `renderer.ts` for CSS styling hooks (not set by components)

### Naming Conventions
- **Store files**: `*State.ts` in `zunstand/` (note: directory is `zunstand`, not `zustand`)
- **Store exports**: `carouselStore`, `dragStore`, `sliderStore`, `sizeStore` (lowercase camelCase)
- **Store inner record key**: same as store name (`carouselStore.carouselStore[id]`)
- **Hook files**: `use*.ts` — one hook per file
- **Hook naming**: `use*Zustand` (store subscription), `use*Sizing` (ResizeObserver), `use*Motion` (CSS style computation)
- **Solver files**: `*Solver.ts` — exports a `Partial<Record<EventType, fn>>`
- **Solver util functions**: `resolve*` prefix for computation, `is*` prefix for checks
- **Context types**: `Ctx*` prefix
- **Descriptor types**: `*Desc` suffix
- **Components use "lane" vocabulary** (`laneSize`, `laneState`, `lanePosition`) — interaction system uses `trackSize`, `size`, `delta`
- **`normalizeParameter`**: converts CSS pixels to device-scaled pixels (divides by `sizeStore.scale`)

### Store Method Naming
Store event methods exactly mirror `EventType` names: `press`, `swipeStart`, `swipe`, `swipeCommit`, `swipeRevert`. Pipeline looks up methods by name: `state[eventName as keyof *Functions]`.

### Config
`APP_SETTINGS` in `config/appSettings.ts` holds: `swipeThresholdRatio` (0.05 — minimum drag distance to start swipe as ratio of screen), `swipeCommitRatio` (0.2 — minimum drag distance to commit as ratio of lane size), `swipeAnimationMs` (250), `hysteresis` (5px — cross-axis gating tolerance).

### Pointer Capture
`usePointerForwarding` calls `el.setPointerCapture(pointerId)` on pointerdown and `el.releasePointerCapture(pointerId)` on pointerup. This ensures all subsequent pointer events route to the capturing element regardless of pointer position. Only one pointer per element is tracked (`isActive` + `activePointerId` refs block additional pointers).
