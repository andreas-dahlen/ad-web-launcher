# Gesture Engine Contract v2

> **Purpose**: Authoritative contract for the gesture interaction engine. Prevents architectural drift by human contributors and AI coding assistants alike.

---

## System Overview

This gesture engine implements a **unidirectional data pipeline** for touch/pointer interactions with strict separation of concerns between layers.

### Ownership Model

| Owner | Responsibility |
|-------|---------------|
| **Vue components** | Own DOM nodes. Attach/detach event listeners (`onMounted`/`onBeforeUnmount`). Forward raw events into the engine. Declare gesture capabilities via `data-*` attributes. Read state for rendering. Otherwise **read-only** with respect to gesture logic. |
| **Gesture engine** | Interprets forwarded events. Resolves targets, derives intent, solves gesture math, dispatches state mutations. Does **not** wire global DOM listeners by default. Does **not** assume `window` unless explicitly required by platform wiring (e.g., Android bridge). Operates on forwarded raw coordinates + contextual metadata. |

### Pipeline

```
Vue DOM Events → Input → IntentDeriver → Delegator → Solver(+Policy) → Dispatcher → State → Vue Render
```

| Layer | Role |
|-------|------|
| **Input** | What happened — raw coordinates, platform routing |
| **IntentDeriver** | Where it happened — target, axis, gesture phase |
| **Delegator** | Package it — build descriptors, route to solvers |
| **Solver** | What it means — commit/revert, clamped deltas |
| **Policy** | How math works — pure functions, thresholds |
| **Dispatcher** | Apply it — state mutations, DOM attributes, events |
| **State** | Own it — mutable truth, getters/setters |
| **Vue Components** | Show it — read-only rendering, DOM lifecycle |

Each layer has explicit knowledge boundaries. Violations degrade maintainability and create debugging nightmares.

---

## Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VUE COMPONENTS (DOM owners)                    │
│                                                                         │
│  Attach pointer/touch listeners in onMounted                            │
│  Forward raw coordinates to the engine                                  │
│  Declare gesture capability via data-* attributes                       │
│  Read state via computed properties for rendering                       │
│  Remove listeners in onBeforeUnmount                                    │
└──────────┬──────────────────────────────────────────────────────────────┘
           │  raw (x, y) coordinates
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             INPUT LAYER                                 │
│                                                                         │
│  inputSource.js — Platform wiring                                       │
│  Detects platform (Android bridge vs browser)                           │
│  Routes raw pointer events to IntentDeriver                             │
│  Manages Android sequence IDs                                           │
│                                                                         │
│  ⚠ Current implementation wires window listeners for browser mode.      │
│  Future: Vue root component forwards events; engine stays DOM-agnostic. │
└──────────┬──────────────────────────────────────────────────────────────┘
           │  onDown(x,y) / onMove(x,y) / onUp(x,y)
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          INTENT DERIVER                                 │
│                                                                         │
│  intentDeriver.js + intentUtils.js + domRegistry.js                     │
│                                                                         │
│  State machine: IDLE → PENDING → SWIPING                                │
│  Resolves targets via domRegistry                                       │
│  Detects axis lock after swipe threshold                                │
│  Normalizes deltas via sizeState                                        │
│  Emits structured intents                                               │
└──────────┬──────────────────────────────────────────────────────────────┘
           │  intentForward({ type, target, delta, axis, pressCancel })
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DELEGATOR                                    │
│                                                                         │
│  delegator.js + buildPayload.js                                         │
│                                                                         │
│  Calls buildPayload() to snapshot state into descriptors                │
│  Routes each descriptor to the solver matching its swipeType + type     │
│  Forwards solver-augmented descriptors to dispatcher                    │
└──────────┬──────────────────────────────────────────────────────────────┘
           │  descriptor (state snapshot + intent)
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SOLVERS + POLICY                                 │
│                                                                         │
│  carouselSolver.js   sliderSolver.js   dragSolver.js                    │
│  solverUtils.js (shared pure math)                                      │
│                                                                         │
│  Solvers: augment descriptors with reaction, direction, resolved delta  │
│  Policy (solverUtils): pure functions — clamp, threshold, direction     │
│  Solvers call policy; policy never calls solvers                        │
└──────────┬──────────────────────────────────────────────────────────────┘
           │  descriptor (augmented with reaction + resolved values)
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DISPATCHER                                    │
│                                                                         │
│  dispatcher.js — Single choke point for all side effects                │
│                                                                         │
│  1. Apply reaction → state mutation via stateManager                    │
│  2. Set DOM attributes (data-pressed, data-swiping)                     │
│  3. Dispatch CustomEvent('reaction') to target element                  │
│  NO decision logic whatsoever                                           │
└──────────┬──────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            STATE LAYER                                  │
│                                                                         │
│  stateManager.js → carouselState.js, sliderState.js, dragState.js       │
│                    sizeState.js                                         │
│                                                                         │
│  Vue reactive() stores — the single source of mutable truth            │
│  Read-only getters for buildPayload and Vue components                  │
│  Mutation exclusively via dispatcher calls                              │
└──────────┬──────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       VUE COMPONENTS (render)                           │
│                                                                         │
│  SwipeCarousel — reads carousel state, renders scenes with translate3d  │
│  SwipeSlider   — reads slider state, renders thumb position             │
│  SwipeDrag     — reads drag state, renders item position                │
│  InputElement  — generic gesture surface, declares data-* attributes    │
│                  Listens for 'reaction' CustomEvents, emits Vue events  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Contracts

### 1. Input Layer (`inputSource.js`)

**Role:** Platform-specific event entry point. Routes raw pointer coordinates to `intentDeriver`.

**Knows:** Raw `(x, y)` coordinates. Platform detection (`APP_SETTINGS.platform`). Pointer event types. Android sequence IDs.

**Does NOT know:** Gesture phase, targets, lanes, axis, swipe types, state, DOM elements beyond event sourcing, deltas.

```javascript
// ✅ Correct: forward raw coordinates
function onPointerDown(e) {
  intentDeriver.onDown(e.clientX, e.clientY)
}

// ❌ Wrong: computing deltas, checking phase, referencing lanes
```

> **Note on DOM listeners:** The current `inputSource.js` wires `window` pointer listeners for browser mode and a global `window.handleTouch` for Android. This is acceptable platform bootstrapping. The architectural direction is for Vue components to own listener attachment and forward raw events. When that migration occurs, `inputSource.js` becomes a thin routing shim receiving forwarded coordinates — its contract does not change.

---

### 2. IntentDeriver (`intentDeriver.js`)

**Role:** Stateful gesture interpreter. Converts raw pointer events into semantic intents via a state machine (`IDLE` → `PENDING` → `SWIPING`).

**Knows:** Raw coordinates. Gesture phase and lifecycle. Start/last positions, accumulated delta. Current target (resolved via `intentUtils`). Axis detection. Swipe threshold.

**Does NOT know:** Lane sizes, bounds, values. Any application state. Commit/revert decisions. Delta clamping or quantization. Policy or solver logic.

**Emits:**
- `press` — pointer down on a pressable target
- `swipeStart` — threshold exceeded, axis locked
- `swipe` — ongoing drag with normalized total delta
- `swipeCommit` — pointer up during swipe
- `pressRelease` — pointer up without swipe

```javascript
// ✅ Correct: forward structured intent with normalized delta
intentForward({
  type: 'swipe',
  target: state.target,
  delta: utils.normalizedDelta(resolvedDelta),
  axis: state.target.axis
})

// ❌ Wrong: clamping delta, deciding commit, importing state modules
```

---

### 3. IntentUtils (`intentUtils.js`)

**Role:** Stateless helpers for the IntentDeriver. Resolves targets, axes, deltas.

**Knows:** DOM registry queries (read-only). Target capability flags. Axis values. SwipeType values. Screen metrics from `sizeState` (threshold, normalization).

**Does NOT know:** Gesture phase. Lane state (value, offset, dragging). Commit/revert logic.

**Does NOT do:** DOM mutation. State mutation.

---

### 4. DOM Registry (`domRegistry.js`)

**Role:** Read-only DOM query layer. Finds gesture-declaring elements at coordinates, reads `data-*` attributes, returns structured target objects.

**Knows:** DOM element positions (`elementsFromPoint`). `data-*` attributes. Derived capability flags.

**Does NOT do:** Mutate DOM. Dispatch events. Read application state.

**Returns:** `{ element, laneId, axis, swipeType, actionId, reactions: { press, swipeStart, swipe, ... } }`

---

### 5. Delegator (`delegator.js`)

**Role:** Bridge between intent and execution. Receives intents, produces descriptors via `buildPayload`, routes descriptors to solvers, forwards results to dispatcher.

**Knows:** Intent structure. Solver registry (`carousel`, `slider`, `drag`). Descriptor fields.

**Does NOT do:** Access state directly. Do math. Mutate DOM. Call policy functions.

```javascript
// ✅ Correct: route to solver, forward to dispatcher
const solverfn = solvers[reaction.swipeType]?.[reaction.type]
if (solverfn) Object.assign(reaction, solverfn(reaction))
dispatcher.handle(reaction)
```

---

### 6. buildPayload (`buildPayload.js`)

**Role:** Snapshot factory. Creates descriptor arrays from intents by reading current state via `stateManager` getters.

**Reads:** `state.getSize()`, `state.getPosition()`, `state.getConstraints()`

**Does NOT do:** Mutate state. Call `state.ensure()`. Clamp or compute values. Make decisions.

---

### 7. Solvers (`carouselSolver.js`, `sliderSolver.js`, `dragSolver.js`)

**Role:** Gesture math and decisions. Receive descriptors, use policy (via `solverUtils`) for pure math, augment descriptors with `reaction`, `direction`, resolved `delta`.

| Solver | Key behavior |
|--------|-------------|
| **Carousel** | Commit vs revert based on threshold. Clamp delta to lane size. Resolve direction. |
| **Slider** | Pixel-to-logical conversion. Clamp to `[min, max]`. Always commits. |
| **Drag** | 2D position clamping. Resolve dominant direction. Always commits. |

**Knows:** Descriptor contents only (`delta`, `laneSize`, `position`, `constraints`, `axis`). Policy function results.

**Does NOT do:** Access state. Access DOM. Dispatch events. Import Vue. Cache descriptors.

**Mutation rule:** Solvers may mutate descriptor fields only because descriptors are frame-local (created fresh by `buildPayload`, never reused after dispatch).

```javascript
// ✅ Carousel commit
if (utils.shouldCommit(clampedDelta, laneSize, axis)) {
  desc.reaction = desc.type
  desc.direction = utils.resolveDirection(clampedDelta, axis)
  desc.delta = utils.getCommitOffset(direction, laneSize)
} else {
  desc.reaction = 'swipeRevert'
}

// ❌ Wrong: reading state, calling ensure(), accessing DOM
```

---

### 8. Policy / solverUtils (`solverUtils.js`)

**Role:** Pure math functions. No side effects of any kind.

**Contains:** `clamp`, `clamp2D`, `relativeClamp2D`, `resolveDirection`, `shouldCommit`, `getCommitOffset`.

**Knows:** Function parameters only. `APP_SETTINGS` constants (read-only).

**Does NOT do:** Import state. Import Vue. Access DOM. Produce side effects (including logging).

```javascript
// ✅ Pure function
export function shouldCommit(delta, laneSize, axis) {
  const axisBias = axis === 'vertical' ? 0.65 : 1
  const threshold = laneSize * APP_SETTINGS.swipeCommitRatio * axisBias
  return Math.abs(delta) >= threshold
}

// ❌ Wrong: importing state, logging, DOM access
```

---

### 9. Dispatcher (`dispatcher.js`)

**Role:** Single choke point for all side effects. Routes solved descriptors to state mutations, sets DOM attributes, dispatches `CustomEvent('reaction')`.

**Does:**
1. Apply `reaction` → `state.swipeStart()` / `swipe()` / `swipeCommit()` / `swipeRevert()`
2. Set DOM attributes (`data-pressed`, `data-swiping`)
3. Dispatch `CustomEvent('reaction')` to the target element

**Does NOT do:** Decision logic. Math. Clamping. Policy calls. Value conversion.

---

### 10. State Layer (`stateManager.js`, `*State.js`, `sizeState.js`)

**Role:** Own ALL mutable truth. Vue `reactive()` stores with read-only getters and mutation methods.

**`stateManager` facade routes to type-specific stores:**

| Method | Called by |
|--------|-----------|
| `getSize(type, laneId)` | buildPayload |
| `getPosition(type, laneId)` | buildPayload |
| `getConstraints(type, laneId)` | buildPayload |
| `get(type, laneId)` | Vue components |
| `ensure(type, laneId)` | Vue components (init only) |
| `setSize(type, laneId, v)` | Vue components (resize) |
| `setCount(type, laneId, n)` | Vue components |
| `setPosition(type, laneId, v)` | Vue components (post-transition) |
| `setConstraints(type, laneId, c)` | Vue components |
| `swipeStart(type, desc)` | Dispatcher |
| `swipe(type, desc)` | Dispatcher |
| `swipeCommit(type, desc)` | Dispatcher |
| `swipeRevert(type, desc)` | Dispatcher |

**State shapes:**

```
Carousel: { index, count, offset, size, dragging, pendingDir }
Slider:   { value, offset, min, max, size, dragging }
Drag:     { position: {x,y}, offset: {x,y}, size, dragging, minX, minY, maxX, maxY }
```

**Does NOT do:** Make commit/revert decisions. Access DOM. Build descriptors. Import solvers.

---

### 11. Vue Components

**Files:** `SwipeCarousel.vue`, `SwipeSlider.vue`, `SwipeDrag.vue`, `InputElement.vue`

**Role:** DOM owners and read-only state consumers.

#### DOM Lifecycle Ownership

Vue components are the **sole owners** of DOM node lifecycles:

- **Attach** event listeners in `onMounted`
- **Detach** event listeners in `onBeforeUnmount`
- **Observe** resize via `ResizeObserver` (created in `onMounted`, disconnected in `onBeforeUnmount`)
- **Forward** raw `PointerEvent` / `TouchEvent` data into the engine as `(x, y)` coordinates Vue components must extract and forward primitive coordinates (x, y) rather than passing DOM events or event objects.

#### Initialization Contract (one-time setup)

| Call | When | Purpose |
|------|------|---------|
| `state.ensure(type, laneId)` | `watchEffect` | Lazily create lane state |
| `state.setSize(type, laneId, v)` | `ResizeObserver` callback | Update lane pixel dimension |
| `state.setCount(type, laneId, n)` | `watchEffect` on scene list | Carousel scene count |
| `state.setConstraints(type, laneId, c)` | `ResizeObserver` callback | Drag bounds |
| `state.setPosition(type, laneId, v)` | `transitionend` handler | Carousel post-animation finalization |

**After initialization, Vue components are strictly read-only with respect to gesture state.**

#### Rendering

- Read state via `computed(() => state.get(type, laneId))`
- Map logical values to pixel positions via CSS `translate3d()`
- Disable CSS transitions during drag (`dragging ? 'none' : ...`)
- Listen for `CustomEvent('reaction')` dispatched by the engine
- Emit Vue events (`@swipeCommit`, etc.) to parent components

#### Does NOT do

- Gesture math (delta computation, pixel-to-logical conversion)
- Clamping logic
- Commit/revert decisions
- Direct input event handling for gesture interpretation (`pointermove` → gesture logic)
- Access solver/policy internals
- Mutate gesture state after initialization

```javascript
// ✅ Correct: read-only computed, CSS transform
const thumbStyle = computed(() => {
  const ratio = (value - min) / range
  const pos = ratio * laneSize.value + laneOffset.value
  return { transform: `translate3d(${pos}px,0,0)` }
})

// ❌ Wrong: gesture math, clamping, commit decisions, direct pointer handling
```

---

## Descriptor Contract

Descriptors are the data packets flowing through the pipeline. They are frame-local and single-use.

### Lifecycle

1. **Created** by `buildPayload` — snapshots state at intent time
2. **Augmented** by a solver — adds `reaction`, `direction`, resolved `delta`
3. **Consumed** by dispatcher — applied to state and DOM
4. **Discarded** — never reused, never cached

### Shape

```
From buildPayload:
  type        'press' | 'pressRelease' | 'pressCancel' | 'swipeStart' | 'swipe' | 'swipeCommit'
  element     HTMLElement
  delta       number | { x, y }
  axis        'horizontal' | 'vertical' | 'both' | null
  laneId      string | null
  swipeType   'carousel' | 'slider' | 'drag' | null
  laneSize    number | null
  position    number | { x, y } | null
  constraints { min, max } | { minX, maxX, minY, maxY } | null

Added by solver:
  reaction    'swipeStart' | 'swipe' | 'swipeCommit' | 'swipeRevert'
  direction?  'left' | 'right' | 'up' | 'down'
  delta       may be overwritten with resolved value
```

### Mutation Rules

- `buildPayload` creates — snapshots, not live references
- Solvers may overwrite `delta` and must set `reaction`
- Dispatcher reads — never mutates
- State reads — never mutates the descriptor
- **No stage may cache or reuse a descriptor across frames**

---

## Consolidated DO NOT Rules

### Universal Rules (all layers)

- DO NOT violate the unidirectional flow (Input → ... → State → Vue)
- DO NOT pass reactive state through the pipeline; `buildPayload` snapshots everything
- DO NOT cache or reuse descriptors across frames
- DO NOT add imports that cross layer boundaries (see per-layer rules below)

### Per-Layer Boundaries

| Layer | Must NOT access | Must NOT do |
|-------|----------------|-------------|
| **Input** | Gesture phase, targets, lanes, state, DOM registry | Compute deltas, reference UI semantics |
| **IntentDeriver** | Lane state (values/offsets/bounds), state modules | Clamp deltas, make commit/revert decisions |
| **IntentUtils** | Lane state, application state | Mutate DOM, make commit/revert decisions |
| **DOM Registry** | Application state | Mutate DOM, dispatch events |
| **Delegator** | State directly, DOM | Do math, call policy functions |
| **buildPayload** | State mutation methods, `state.ensure()` | Clamp values, make decisions |
| **Solvers** | State directly, DOM, Vue, `state.ensure()` | Dispatch events, cache descriptors |
| **Policy (solverUtils)** | State, Vue, DOM | Any side effects (including logging) |
| **Dispatcher** | Policy functions, solver logic | Decision logic, math, clamping |
| **State** | DOM, solvers, descriptors building | Make commit/revert decisions |
| **Vue Components** | Solver/policy internals, other components' state | Gesture math, clamping, commit decisions, direct gesture input handling |

### Special Rules

- **`state.ensure()` is Vue-only** — called during component initialization only. Never from solvers, delegator, buildPayload, or dispatcher.
- **State reads are layered:**
  - `buildPayload` reads via `stateManager` getters → produces descriptors
  - Vue components read via `state.get()` → produces computed properties
  - Solvers **never** read state — they receive everything via descriptors
- **Policy functions are pure** — no side effects of any kind, including `console.log`

---

## For AI Assistants

When modifying this codebase:

1. **Identify the layer** before making changes. Use the file list and diagram.
2. **Check the per-layer contract** for allowed and forbidden knowledge.
3. **Never add imports** that violate layer boundaries.
4. **When in doubt**, keep logic in the lower layer:
   - Math → policy (`solverUtils`)
   - Decisions → solver
   - Mutations → state (via dispatcher)
   - DOM lifecycle → Vue component
   - Rendering → Vue component
5. **Descriptors flow down** — never pass reactive state through the pipeline.
6. **Vue components own DOM** — listener attachment, `ResizeObserver`, and cleanup belong in `onMounted`/`onBeforeUnmount`. The engine operates on forwarded coordinates, not raw DOM events.
7. **If a feature requires knowledge from a forbidden source**, the architecture needs extension — not violation. Flag this explicitly and consult the contract before proceeding. Do not invent workarounds that cross boundaries.
8. **Do not invent new layers, concepts, or pipeline stages.** If the current architecture cannot support a feature, annotate the gap rather than guessing.
9. **Behavioral invariants are sacred.** Same gestures, same thresholds, same solver decisions, same state mutations, same descriptor semantics. Do not alter math, commit logic, or state transition behavior.

---

## Version History

| Date | Change |
|------|--------|
| 2026-02-07 | v1: Initial contract formalization |
| 2026-02-09 | v1: Rewrite for refactored pipeline (intentDeriver, delegator, buildPayload) |
| 2026-02-10 | v2: Clarified Vue ownership model (DOM lifecycle, event forwarding). Consolidated DO NOT rules. Shortened per-layer contracts. No behavioral changes. |
