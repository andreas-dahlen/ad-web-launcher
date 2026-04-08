# Gesture System Contract

## System Purpose

This system converts raw pointer events into semantic gesture intents for a mobile launcher UI built with Vue 3. It supports four interaction primitives — **carousel** (discrete page swipes), **slider** (continuous 1D value control), **drag** (2D position control), and **button** (press/release) — through a unified pipeline that separates intent interpretation, domain-specific solving, state mutation, and rendering.

The app runs as a WebView inside an Android APK. A `DebugWrapper` simulates the device frame in a desktop browser by scaling a fixed logical device size to fit the viewport.

## High-Level Architecture

```
Pointer Events (DOM)
        │
    ┌───▼───┐
    │ Bridge │  usePointerForwarding — captures pointerdown/move/up/cancel
    └───┬───┘  per-element, calls pipeline.orchestrate({eventType, x, y})
        │
    ┌───▼──────┐
    │ Pipeline  │  Orchestrator — routes through interpreter → solver → state → renderer
    └───┬──────┘
        │
   ┌────▼──────────┐
   │  Interpreter   │  IntentMapper — stateful gesture FSM
   │  (+ intentUtils│  Resolves targets from DOM (via targetResolver)
   │   + targetRes.)│  Produces semantic descriptors: press, swipeStart, swipe, swipeCommit, pressRelease
   └────┬──────────┘
        │ descriptor
   ┌────▼──────┐
   │  Solvers   │  carouselSolver / sliderSolver / dragSolver
   │            │  Pure math: clamping, snapping, commit/revert decisions
   └────┬──────┘  Returns augmentation patch (merged onto descriptor by pipeline)
        │ solution
   ┌────▼──────┐
   │   State    │  stateManager → carouselState / sliderState / dragState
   │            │  Vue reactive stores; mutated only if solver sets stateAccepted: true
   └────┬──────┘
        │
   ┌────▼──────┐
   │  Renderer  │  Sets DOM attributes (data-pressed, data-swiping)
   │            │  Dispatches CustomEvent('reaction', {detail: descriptor})
   └────┬──────┘
        │ CustomEvent
   ┌────▼──────────┐
   │ Vue Components │  SwipeLane / InputElement / MirrorCarousel
   │                │  Listen for 'reaction' events, emit Vue events
   │                │  Read reactive state for computed styles (motion)
   └────────────────┘
```

## Gesture Pipeline

### Entry Point
`bridge.js` exports `usePointerForwarding({ elRef, onReaction })` — a Vue composable mounted per interactive element. It:
1. Captures `pointerdown` (with `setPointerCapture`), `pointermove`, `pointerup`, and `pointercancel`.
2. Calls `e.stopPropagation()` on down to prevent duplicate captures.
3. Forwards `{eventType: 'down'|'move'|'up', x: e.clientX, y: e.clientY}` to `pipeline.orchestrate()`.
4. Listens for `CustomEvent('reaction')` on the same element and calls the `onReaction` callback.

### Pipeline Orchestration (`pipeline.js`)

```
orchestrate(desc) →
  1. interpreter[eventType](x, y)   → descriptor | null
  2. solvers[descriptor.type]?.[descriptor.event]?(descriptor)  → patch | undefined
  3. merge: solution = { ...descriptor, ...patch }
  4. if patch.gestureUpdate → interpreter.applyGestureUpdate(patch.gestureUpdate)
  5. if solution.stateAccepted && state[solution.event] → state[event](type, solution)
  6. if solution.cancel → render.handle(solution.cancel)
  7. render.handle(solution)
```

The pipeline is synchronous. Each pointer event produces at most one descriptor that flows linearly through the chain.

## Layer Responsibilities

### Bridge (`interaction/bridge/bridge.js`)
- **Role**: DOM event capture and forwarding.
- **Reads**: DOM pointer events.
- **Writes**: Nothing (forwards to pipeline).
- **Side effects**: `setPointerCapture` / `releasePointerCapture` on DOM elements.

### Interpreter (`interaction/core/interpreter.js`)
- **Role**: Stateful gesture FSM. Converts raw `{x, y}` pointer coordinates into semantic gesture descriptors.
- **Reads**: Internal gesture state (`phase`, `start`, `last`, `totalDelta`, `desc`). Calls `intentUtils` which queries DOM (via `targetResolver`).
- **Writes**: Internal gesture state. Descriptor is newly created each call (not mutated in place).
- **Side effects**: Calls `drawDots()` (debug only, gated by flag).
- **Note**: Has a back-channel `applyGestureUpdate(update)` allowing solvers to push values back into the stored descriptor (used by slider solver for `sliderStartOffset` and `sliderValuePerPixel`).

### Target Resolver (`interaction/core/targetResolver.js`)
- **Role**: Resolves pointer coordinates to a gesture target descriptor by querying DOM `data-*` attributes.
- **Reads**: DOM via `document.elementsFromPoint()`, element `dataset`, state via `stateManager` (for lane sizes, positions, constraints, indices).
- **Writes**: Nothing.
- **Side effects**: DOM query only.
- **Output**: A descriptor object with base fields, reactions, and type-specific sub-objects.

### Intent Utilities (`interaction/core/intentUtils.js`)
- **Role**: Helper functions for the interpreter — threshold calculation, axis resolution, target resolution, delta normalization, start offset computation.
- **Reads**: `APP_SETTINGS`, `sizeState` (for viewport scale and axis sizes), DOM (`getBoundingClientRect`).
- **Writes**: Nothing.

### Solvers (`interaction/solvers/`)
- **Role**: Domain-specific gesture math. Receive a descriptor, return an augmentation patch.
- **Reads**: Descriptor fields only.
- **Writes**: Nothing directly; return patches that the pipeline merges.
- **Invariant**: Solvers must not access DOM or mutate state.

| Solver | Key behaviors |
|--------|--------------|
| `carouselSolver` | Clamps delta to lane size; commit/revert decision based on `swipeCommitRatio`; lock gate via `lockSwipeAt`; converts `swipeCommit` → `swipeRevert` when below threshold |
| `sliderSolver` | On `swipeStart`, computes initial value from pointer offset; on `swipe`/`swipeCommit`, converts pixel delta to logical value within `[min, max]`; never reverts |
| `dragSolver` | Clamps 2D delta within constraints; on `swipeCommit`, computes absolute position with optional snap-to-grid; resolves dominant direction; never reverts |

### Solver Utilities (`interaction/solvers/solverUtils.js`)
- **Role**: Shared math for solvers — 1D normalization (axis projection), gating (cross-axis bounds check), carousel commit logic, slider value mapping, drag clamping/snapping.

### Vector Utilities (`interaction/solvers/vectorUtils.js`)
- **Role**: Pure math helpers — `clamp`, `clamp2D`, `relativeClamp2D`, `resolveByAxis1D`, `resolveDirection`.

### State Manager (`interaction/state/stateManager.js`)
- **Role**: Unified facade over type-specific Vue reactive stores.
- **Reads**: Delegates to `carouselStateFn`, `sliderStateFn`, `dragStateFn`.
- **Writes**: Same delegation.
- **API categories**:
  - Metadata reads: `getSize`, `getThumbSize`, `getPosition`, `getConstraints`, `getCurrentIndex`
  - Vue reads: `get(type, id)` returns readonly computed views
  - Configuration writes: `ensure`, `setCount`, `setSize`, `setThumbSize`, `setPosition`, `setConstraints`
  - Gesture writes: `swipeStart`, `swipe`, `swipeCommit`, `swipeRevert`

### Type-Specific State Files

**`carouselState.js`** — `reactive({ lanes: {} })`
- Fields per lane: `index`, `count`, `offset`, `size`, `dragging`, `pendingDir`, `lockPrevAt`, `lockNextAt`
- `swipeCommit` sets `pendingDir` and `offset` (triggers CSS transition). `setPosition` (called on `transitionend`) finalizes `index` via `getNextIndex()` and zeroes offset.
- Vue view exposes `offset`, `index`, `dragging`, `size`, `count`, `progress` (computed `offset/size`).

**`sliderState.js`** — `reactive({ sliders: {} })`
- Fields per slider: `value`, `offset`, `min`, `max`, `size` (+ dynamically added `dragging`, `thumbSize`)
- Updates `value` on `swipeStart`, `swipe`, and `swipeCommit`.
- Vue view exposes `value`, `offset`, `dragging`.

**`dragState.js`** — `reactive({ lanes: {} })`
- Fields per lane: `position: {x,y}`, `offset: {x,y}`, `size`, `dragging` (+ dynamically added `minX`, `maxX`, `minY`, `maxY`)
- `swipe` updates `offset` (live drag). `swipeCommit` updates `position` and zeroes `offset`.
- Vue view exposes `position`, `offset`, `dragging`.

### Size State (`interaction/state/sizeState.js`)
- **Role**: Device dimensions, viewport scaling, and normalization.
- **Reads**: `window.__DEVICE` (injected by APK or DebugWrapper), `window.innerWidth/Height`, `APP_SETTINGS.rawPhoneValues`.
- **Exports**: `device` (computed), `scale` (computed), `getAxisSize(axis)`, `normalizeParameter(px)`.
- `normalizeParameter(px) = px / scale.value` — converts viewport CSS pixels to the element's CSS pixel space (logical device space).

### Renderer (`interaction/updater/renderer.js`)
- **Role**: Single choke point for DOM side effects during gesture handling.
- **Reads**: Descriptor (event type, element).
- **Writes**: DOM attributes (`data-pressed`, `data-swiping`), dispatches `CustomEvent('reaction')`.

### Vue Components

**`SwipeLane.vue`** — Multi-type lane component (carousel | slider | drag | button). Handles:
- State initialization (`state.ensure`, `state.setCount`)
- Sizing via composables (`useLaneSizing`, `useSliderSizing`, `useDragSizing`)
- Motion styles via composables (`useCarouselMotion`, `useSliderMotion`, `useDragMotion`)
- Scene rendering (carousel only, via `useCarouselScenes`)
- Pointer forwarding and reaction listening (via `usePointerForwarding`)
- Emits Vue events: `swipeCommit`, `volumeChange`, `press`, `pressRelease`, `pressCancel`

**`MirrorCarousel.vue`** — Read-only carousel that mirrors the state of another carousel by `sourceId`. Does not register pointer forwarding. Renders the same scenes with synchronized motion.

**`InputElement.vue`** — Generic gesture surface. Declares gesture capabilities via `data-*` attributes. Forwards all reactions as Vue events. Does not manage any state or sizing internally.

**`DragOrSlot.vue`** — Wrapper that renders a `SwipeLane type="drag"` when drag is unlocked, or a fallback slot when `USER_SETTINGS.dragLock` is true.

### Lane Composables

**`useLaneSizing.js`** — ResizeObserver-based sizing that writes `{x, y}` dimensions to state.
**`useLaneMotion.js`** — Computed CSS transform styles driven by reactive state.
**`useLaneScenes.js`** — Carousel scene index resolution (prev/current/next with wrapping).

## Gesture Lifecycle

```
IDLE ──(pointerdown)──► PENDING
  │                        │
  │                   [resolveTarget]
  │                   [if pressable → emit 'press']
  │                        │
  │              ┌─────────┴──────────┐
  │              │                    │
  │    (move > threshold)    (pointerup, no swipe)
  │              │                    │
  │         SWIPING              'pressRelease'
  │              │                    │
  │     [resolveSwipeTarget]       IDLE ◄─┘
  │     [emit 'swipeStart']
  │     [optional 'pressCancel' if target changed]
  │              │
  │         (pointermove)
  │              │
  │         'swipe' (repeated)
  │              │
  │         (pointerup)
  │              │
  │         'swipeCommit'
  │         [solver may convert to 'swipeRevert']
  │              │
  └──────── IDLE ◄─┘
```

### Axis Resolution
- On `pointerdown` → target is resolved but axis is NOT locked.
- On threshold exceeded → dominant axis is computed from absolute deltas (`absX > absY ? 'horizontal' : 'vertical'`).
- `resolveSwipeTarget` checks if the initial target supports the intent axis. If not, falls back to `resolveLaneByAxis` which searches DOM for a lane matching the axis.
- Axis is effectively locked at `swipeStart` because the descriptor's `axis` is set from the resolved target and doesn't change.

### Delta Semantics

| Event | Delta contents | Coordinate space |
|-------|---------------|-----------------|
| `press` | `{x, y}` — pointer position | Viewport CSS px (raw clientX/Y) |
| `pressRelease` | `{x, y}` — pointer position | Viewport CSS px |
| `pressCancel` | `{x, y}` — pointer position | Viewport CSS px |
| `swipeStart` | `{x, y}` — pointer position | Viewport CSS px |
| `swipe` | `{x, y}` — accumulated delta / scale | Logical device px (element CSS px space) |
| `swipeCommit` | `{x, y}` — accumulated delta / scale | Logical device px |
| `swipeRevert` | (same as swipeCommit, converted by solver) | Logical device px |

Solvers further transform deltas:
- **carousel**: `swipe` → axis-projected delta (number); `swipeCommit` → full lane offset or 0 (revert).
- **slider**: `swipeStart` → logical value at pointer; `swipe`/`swipeCommit` → logical value within [min, max].
- **drag**: `swipe` → clamped relative `{x, y}`; `swipeCommit` → absolute position `{x, y}` (with optional snap).

## Payload / Descriptor Format

### Base descriptor (from interpreter)
```js
{
  // — Target info (from targetResolver) —
  element,           // DOM element
  id,                // string | null (data-id)
  axis,              // 'horizontal' | 'vertical' | 'both' | null
  type,              // 'carousel' | 'slider' | 'drag' | null
  actionId,          // string | null (data-action)
  startOffset,       // {x, y} | null — normalized pointer offset within element

  // — Reactions —
  reactions: {
    pressable,       // boolean
    swipeable,       // boolean
    modifiable       // boolean
  },

  // — Type-specific sub-objects (present when type matches) —
  carousel?: {
    index,           // current scene index
    size,            // {x, y} — lane dimensions in CSS px
    lockSwipeAt?     // {prev, next} — 1-indexed lock boundaries
  },
  slider?: {
    thumbSize,       // {x, y} — thumb dimensions in CSS px
    constraints,     // {min, max} — logical value range
    size             // {x, y} — track dimensions in CSS px
  },
  drag?: {
    position,        // {x, y} — committed position
    constraints,     // {minX, maxX, minY, maxY}
    snap?,           // {x, y} — snap grid counts
    locked?          // boolean
  },

  // — Gesture event info (added by interpreter) —
  event,             // 'press' | 'pressRelease' | 'pressCancel' | 'swipeStart' | 'swipe' | 'swipeCommit'
  delta,             // varies by event (see Delta Semantics)
  cancel?            // pressCancel descriptor (on swipeStart only, when target changed)
}
```

### Solver augmentation (merged onto descriptor)
```js
{
  event?,            // solvers may change 'swipeCommit' → 'swipeRevert' (carousel only)
  delta?,            // overridden with solved value
  direction?,        // 'left' | 'right' | 'up' | 'down' (carousel commit, drag commit)
  stateAccepted,     // boolean — gates state mutation
  gestureUpdate?     // object merged back into interpreter's stored descriptor
}
```

## State Ownership

| State | Owner | Writers | Readers |
|-------|-------|---------|---------|
| Gesture lifecycle (`phase`, `start`, `last`, `totalDelta`, `desc`) | `interpreter.js` | interpreter, `applyGestureUpdate` (from solver via pipeline) | interpreter only |
| Carousel lane state | `carouselState.js` | `stateManager` (gesture writes), `SwipeLane` (config writes via `setCount`, `setSize`), `useLaneSizing` (size), `onTransitionEnd` (index finalization) | `SwipeLane`, `MirrorCarousel`, `targetResolver`, `useLaneMotion`, `useLaneScenes` |
| Slider lane state | `sliderState.js` | `stateManager` (gesture writes), `SwipeLane` (config via `setConstraints`, `setSize`, `setThumbSize`), `useSliderSizing` | `SwipeLane`, `targetResolver`, `useLaneMotion` |
| Drag lane state | `dragState.js` | `stateManager` (gesture writes), `useDragSizing` (size, constraints), `SwipeLane` (config via `setPosition`) | `SwipeLane`, `targetResolver`, `useLaneMotion` |
| Device/viewport info | `sizeState.js` | `window.__DEVICE` (injected), viewport (read-only) | `intentUtils`, `DebugWrapper`, solvers (indirectly via normalized deltas) |
| App settings | `appSettings.js` | `AppSettingsPanel` (USER_SETTINGS, reactive) | solvers, interpreter, sizing, motion, components |

## System Invariants

1. **The pipeline is synchronous.** Each pointer event is fully processed (interpret → solve → state → render) before the next event.
2. **Solvers must not access DOM or mutate state.** They receive a descriptor and return an augmentation patch.
3. **State mutation is gated by `stateAccepted`.** If a solver returns `stateAccepted: false` (or omits it), the state manager is not called.
4. **Only solvers may convert `swipeCommit` → `swipeRevert`.** This only applies to carousel (via commit threshold logic).
5. **Carousel index is finalized by `transitionend`, not by the gesture pipeline.** The pipeline sets `pendingDir` and `offset`; CSS animates; `transitionend` calls `setPosition` to update `index`.
6. **Slider and drag never revert.** They always commit at the current position.
7. **Axis is effectively locked at `swipeStart`.** The resolved target's axis determines gesture direction for the remainder of the lifecycle.
8. **Descriptors are mutable only during pipeline processing.** After the pipeline finishes (solver merge + state + render), the descriptor should be treated as immutable.
9. **`usePointerForwarding` provides single-pointer semantics.** Only one pointer is tracked at a time (`activePointerId`). Additional pointers are ignored.
10. **Renderer is the sole performer of DOM side effects during gesture handling.** It sets data attributes and dispatches custom events.

## Forbidden Patterns

1. **DOM access in solvers.** Solvers must operate on descriptor data only.
2. **State mutation outside the `stateManager` during gesture processing.** Sizing composables may write configuration state, but only outside the gesture lifecycle.
3. **Changing `type` or `id` after swipeStart.** The lane identity is fixed for the gesture lifecycle.
4. **Calling `state[event]` without checking `stateAccepted`.** The pipeline gates this; bypassing the gate would cause uncontrolled state mutations.
5. **Relying on DOM state in solvers or state files.** All necessary information must be on the descriptor or in reactive state.
6. **Multiple simultaneous gestures.** The interpreter is a singleton FSM. Attempting concurrent gestures will corrupt state.

## Known Edge Cases

1. **`pointercancel` is treated as `pointerup`.** This means a browser-initiated cancel (e.g., scroll takeover) triggers `swipeCommit` instead of a revert. For carousel, solvers may convert to `swipeRevert` if below threshold, but for slider/drag, the position commits wherever the pointer was.
2. **Slider tap-to-position is not supported.** Sliders are not marked as `pressable`, so tapping a slider (down + up without crossing swipe threshold) produces a `pressRelease` that no solver handles. The slider value does not change.
3. **Target fallback on swipeStart.** If the original press target doesn't support the detected swipe axis, `resolveSwipeTarget` will search for a lane element at the pointer position that matches the axis. This can change the target mid-gesture (with a `pressCancel` on the original target).
4. **Cross-axis gating.** If the pointer moves beyond the element's cross-axis boundary during a swipe, solvers return `stateAccepted: false`, freezing state but still dispatching the render event. The gesture continues but state stops updating until the pointer re-enters bounds.
5. **Carousel `pendingDir` and rapid gestures.** If a new gesture starts before `transitionend` fires (e.g., user swipes quickly again), `setPosition` for the previous gesture hasn't run yet. The carousel's `index` is stale and `offset` will be overwritten. This could cause visual glitches or skipped scenes.

## Current `src` Structure

```text
src/
  App.vue
  main.js
  animations/
  assets/
    icons/
    images/
    sounds/
  components/
    DragGridVisual.vue
    DragOrSlot.vue
    InputElement.vue
    buttons/
      ButtonRoot.vue
      TestButton.vue
  config/
    appSettings.js
    AppSettingsPanel.vue
  debug/
    debugFlags.js
    DebugPanel.vue
    DebugWrapper.vue
    functions.js
  interaction/
    bridge/
      bridge.js
    core/
      intentUtils.js
      interpreter.js
      pipeline.js
      targetResolver.js
    solvers/
      carouselSolver.js
      dragSolver.js
      sliderSolver.js
      solverUtils.js
      vectorUtils.js
    state/
      carouselState.js
      dragState.js
      sizeState.js
      sliderState.js
      stateManager.js
    updater/
      renderer.js
  lanes/
    MirrorCarousel.vue
    SwipeLane.vue
    useLaneMotion.js
    useLaneScenes.js
    useLaneSizing.js
  layers/
    CarouselLayer.vue
    InteractiveLayer.vue
    OverlayLayer.vue
    WallpaperLayer.vue
  scenes/
    laneIndex.js
    Root.vue
    bottom/
      3A.vue
      3B.vue
      3C.vue
    mid/
      2A.vue
      2B.vue
      2C.vue
    mirrorLanes/
      Bottom1.vue
      Bottom2.vue
      Bottom3.vue
      Mid1.vue
      Mid2.vue
      Mid3.vue
      Top1.vue
      Top2.vue
      Top3.vue
      Wall1.vue
      Wall2.vue
      Wall3.vue
    top/
      1A.vue
      1B.vue
      1C.vue
    wallpaper/
      WallA.vue
      WallB.vue
      WallC.vue
  styles/
    main.css
    objects.css
    scenes.css
    variables.css
    vue-components.css
```