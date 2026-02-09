# Gesture Engine Contract

> **Purpose**: This document defines the authoritative contract for the gesture interaction engine. It exists to prevent architectural drift by both human contributors and AI coding assistants.

---

## System Purpose

This gesture engine implements a **unidirectional data pipeline** for handling touch/pointer interactions. The design enforces strict separation of concerns and prevents accidental coupling between layers.

**Mental model:**

| Layer | Role |
|-------|------|
| **Input** | What happened (raw coordinates, platform events) |
| **IntentDeriver** | Where it happened (target, axis, gesture phase) |
| **Delegator** | Package it (build descriptors, route to solvers) |
| **Solver** | What it means (commit/revert, clamped deltas) |
| **Policy** | How math works (pure functions, thresholds) |
| **Dispatcher** | Apply it (state mutations, DOM attributes, events) |
| **State** | Own it (mutable truth, getters/setters) |
| **Vue Components** | Show it (read-only rendering) |

**The pipeline transforms input as follows:**
```
Raw Input → IntentDeriver → Delegator → Solver → Dispatcher → State → Vue Render
```

Each layer has explicit knowledge boundaries. Violating these boundaries degrades maintainability and creates debugging nightmares.

---

## Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             INPUT LAYER                                      │
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │   inputSource     │   Platform wiring (browser pointers / Android bridge) │
│  │                    │   Detects platform, wires events, forwards x/y       │
│  └────────┬───────────┘                                                      │
└───────────│──────────────────────────────────────────────────────────────────┘
            │  onDown(x,y) / onMove(x,y) / onUp(x,y)
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTENT DERIVER                                      │
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐                                │
│  │  intentDeriver    │───▶│   intentUtils     │                               │
│  │                    │    │                    │                              │
│  │  Gesture state     │    │  resolveTarget()   │  ◄── domRegistry            │
│  │  machine (IDLE →   │    │  resolveSwipeTarget │                            │
│  │  PENDING → SWIPING)│    │  resolveAxis()      │                            │
│  │                    │    │  resolveDelta()      │                            │
│  │  Emits structured  │    │  normalizedDelta()   │                            │
│  │  intents           │    │  swipeThresholdCalc()│  ◄── sizeState            │
│  └────────┬───────────┘    └──────────────────────┘                           │
└───────────│──────────────────────────────────────────────────────────────────┘
            │  intentForward({ type, target, delta, axis, pressCancel })
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DELEGATOR                                         │
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐                                │
│  │   delegator       │───▶│   buildPayload    │                               │
│  │                    │    │                    │                              │
│  │  Receives intents  │    │  Snapshots state   │  ◄── stateManager (read)    │
│  │  Calls buildPayload│    │  via getSize(),     │                            │
│  │  Routes descriptors│    │  getPosition(),     │                            │
│  │  to solvers        │    │  getConstraints()   │                            │
│  │  Forwards results  │    │                    │                              │
│  │  to dispatcher     │    │  Returns descriptor │                            │
│  └────────┬───────────┘    │  array              │                            │
│           │                └──────────────────────┘                           │
└───────────│──────────────────────────────────────────────────────────────────┘
            │  descriptor (with state snapshot)
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SOLVERS                                          │
│                                                                              │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐                   │
│  │ carouselSolver  │  │  sliderSolver    │  │  dragSolver   │                 │
│  │                  │  │                   │  │               │                │
│  │ commit/revert    │  │ pixel→logical     │  │ 2D clamp +    │                │
│  │ direction        │  │ clamp to bounds   │  │ position      │                │
│  └───────┬──────────┘  └────────┬──────────┘  └──────┬────────┘              │
│          │                      │                     │                       │
│          ▼                      ▼                     ▼                       │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐               │
│  │ carouselPolicy  │  │  sliderPolicy    │  │  dragPolicy      │              │
│  │ (pure math)      │  │  (pure math)     │  │  (pure math)     │             │
│  └──────────────────┘  └─────────────────┘  └──────────────────┘             │
└───────────│──────────────────────────────────────────────────────────────────┘
            │  descriptor (augmented with reaction, direction, resolved delta)
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DISPATCHER                                         │
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │   dispatcher      │                                                       │
│  │                    │  1. Apply reaction → state mutation                   │
│  │  Single choke      │  2. Set DOM attributes (data-pressed, data-swiping)  │
│  │  point for all     │  3. Dispatch CustomEvent('reaction') to element      │
│  │  side effects      │                                                      │
│  └────────┬───────────┘                                                      │
└───────────│──────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STATE LAYER                                       │
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │  stateManager     │  Facade routing to type-specific stores               │
│  └────────┬──────────┘                                                       │
│           │                                                                  │
│  ┌────────┴──────────────────────────────────────────────┐                   │
│  │                                                        │                  │
│  ▼                        ▼                        ▼      │                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │                  │
│  │ carouselState │  │ sliderState   │  │  dragState    │   │                  │
│  │               │  │               │  │               │   │                  │
│  │ index, count, │  │ value, offset │  │ position,     │   │                  │
│  │ offset, size, │  │ min, max,     │  │ offset,       │   │                  │
│  │ dragging,     │  │ size, dragging│  │ constraints,  │   │                  │
│  │ pendingDir    │  │               │  │ dragging      │   │                  │
│  └───────────────┘  └───────────────┘  └───────────────┘   │                  │
│                                                              │               │
│  ┌──────────────┐                                            │               │
│  │  sizeState    │  Device metrics, scale, delta normalization│              │
│  └──────────────┘                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VUE COMPONENTS                                      │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                  │
│  │ SwipeCarousel   │  │ SwipeSlider    │  │  SwipeDrag     │                  │
│  │                  │  │                │  │                │                  │
│  │ Reads state      │  │ Reads state    │  │ Reads state    │                 │
│  │ Renders scenes   │  │ Renders thumb  │  │ Renders item   │                 │
│  └──────────────────┘  └────────────────┘  └────────────────┘                │
│                                                                              │
│  ┌────────────────┐                                                          │
│  │ InputElement    │  Generic gesture surface, declares data-* attributes    │
│  │                  │  Listens for 'reaction' events, emits Vue events       │
│  └──────────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Contracts

### 1. Input Layer

**File:** `inputSource.js`

#### Responsibilities
- Detect platform (Android vs browser) using `APP_SETTINGS.platform`
- Wire platform-specific event sources once
- Route raw pointer events to `intentDeriver`
- Manage sequence IDs for Android touch streams

#### Allowed Knowledge
- Raw pointer coordinates (x, y)
- Platform detection (Android vs browser)
- Pointer event types (down, move, up, cancel)
- Android sequence IDs

#### Forbidden Knowledge
- ❌ Gesture phase or state (IDLE, PENDING, SWIPING)
- ❌ Lane IDs, axis, or swipe types
- ❌ Carousel/slider/drag semantics
- ❌ DOM elements beyond event sourcing
- ❌ Any state or reactive values
- ❌ CSS or visual rendering
- ❌ Delta computation

#### Correct Usage Example
```javascript
// inputSource.js - forwarding raw coordinates
function onPointerDown(e) {
  intentDeriver.onDown(e.clientX, e.clientY)
}
function onPointerMove(e) {
  intentDeriver.onMove(e.clientX, e.clientY)
}
```

#### Violation Examples
```javascript
// ❌ WRONG: Computing deltas
const deltaX = e.clientX - lastX  // NO! IntentDeriver's job

// ❌ WRONG: Checking gesture state
if (phase === 'SWIPING') return  // NO! Don't know about phases

// ❌ WRONG: Referencing lanes
if (target.laneId) route(target)  // NO! Don't know about lanes
```

---

### 2. IntentDeriver

**File:** `intentDeriver.js` (uses `intentUtils.js`, `domRegistry.js`)

#### Responsibilities
- Maintain the gesture state machine: `IDLE` → `PENDING` → `SWIPING`
- Track start position, last position, and accumulated total delta
- Resolve gesture targets via `intentUtils.resolveTarget()` (which calls `domRegistry`)
- Detect axis lock (horizontal vs vertical) after swipe threshold
- Resolve swipe targets with axis compatibility via `intentUtils.resolveSwipeTarget()`
- Emit structured intents to the delegator: `press`, `swipeStart`, `swipe`, `swipeCommit`, `pressRelease`
- Normalize deltas via `intentUtils.normalizedDelta()` before forwarding
- Handle `pressCancel` when swipe ownership transfers away from a pressed target

#### Allowed Knowledge
- Raw pointer coordinates (x, y)
- Gesture phase (IDLE, PENDING, SWIPING)
- Start/last pointer positions and accumulated delta
- Current gesture target (resolved via intentUtils)
- Axis detection (horizontal vs vertical from delta magnitude)
- Swipe threshold (via `intentUtils.swipeThresholdCalc`)
- Resolved axis and target support flags

#### Forbidden Knowledge
- ❌ Lane sizes, bounds, or values
- ❌ State (carousel, slider, or drag state)
- ❌ Commit/revert decisions
- ❌ Delta clamping or quantization
- ❌ Policy or solver logic
- ❌ CSS or rendering
- ❌ Direct state mutation

#### Correct Usage Example
```javascript
// intentDeriver.js - Forwarding a swipe intent
const resolvedDelta = utils.resolveDelta(state.totalDelta, state.target.axis, state.target.swipeType)

intentForward({
  type: 'swipe',
  target: state.target,
  delta: utils.normalizedDelta(resolvedDelta),
  axis: state.target.axis
})
```

#### Violation Examples
```javascript
// ❌ WRONG: Clamping delta
const clamped = Math.min(max, delta)  // NO! Solver's job via policy

// ❌ WRONG: Deciding commit vs revert
if (delta > threshold) commit()  // NO! Solver's job

// ❌ WRONG: Importing state
import { sliderState } from '../state/sliderState'  // NO!

// ❌ WRONG: Accessing lane size
const size = state.getSize('carousel', laneId)  // NO! buildPayload's job
```

---

### 3. IntentUtils

**File:** `intentUtils.js` (uses `domRegistry.js`, `sizeState.js`)

#### Responsibilities
- Resolve gesture targets from coordinates via `domRegistry.findElementAt()`
- Resolve swipe targets with axis fallback via `domRegistry.findLaneByAxis()`
- Validate axis compatibility between intent and target
- Extract axis-appropriate delta (x, y, or scalar) based on `swipeType`
- Normalize deltas through `sizeState.normalizeSwipeDelta()`
- Compute swipe threshold from screen size ratio

#### Allowed Knowledge
- DOM registry queries (read-only)
- Target capability flags (`reactions` map)
- Axis values (horizontal, vertical, both)
- SwipeType values (carousel, slider, drag)
- Screen metrics from `sizeState` (for threshold and normalization)

#### Forbidden Knowledge
- ❌ Gesture phase or lifecycle
- ❌ Lane state (value, offset, dragging, bounds)
- ❌ Commit/revert logic
- ❌ DOM mutation
- ❌ Solver or policy logic
- ❌ State mutations

#### Correct Usage Example
```javascript
// intentUtils.js - resolving axis compatibility
resolveAxis(intentAxis, target) {
  if (!target?.axis) return null
  if (target.axis === 'both') return 'both'
  if (target.axis === intentAxis) return intentAxis
  return null
}
```

#### Violation Examples
```javascript
// ❌ WRONG: Reading lane state
const offset = sliderState.sliders[laneId].offset  // NO!

// ❌ WRONG: Mutating DOM
el.setAttribute('data-active', true)  // NO!
```

---

### 4. DOM Registry

**File:** `domRegistry.js`

#### Responsibilities
- Query DOM for gesture-declaring elements at coordinates (`elementsFromPoint`)
- Read `data-*` attributes from elements
- Build capability maps (`reactions` object with press, swipe, etc.)
- Find lane elements by axis compatibility
- Return structured target objects with element, laneId, axis, swipeType, reactions

#### Allowed Knowledge
- DOM element positions
- `data-*` attributes (lane, axis, swipeType, action, react-*)
- Derived capability flags (pressable, swipeable, selectable, etc.)

#### Forbidden Knowledge
- ❌ Gesture state or phase
- ❌ Lane values, offsets, or bounds
- ❌ Any mutable application state
- ❌ DOM mutation
- ❌ Event dispatch
- ❌ Reaction handling

#### Correct Usage Example
```javascript
// Reading DOM attributes - correct
const laneId = ds.lane || null
const axis = ds.axis || null
const swipeType = ds.swipeType || null

const reactions = {
  press: pressable,
  swipeStart: swipeable,
  swipe: swipeable,
  swipeCommit: swipeable
}
```

#### Violation Examples
```javascript
// ❌ WRONG: Mutating DOM
el.setAttribute('data-active', true)  // NO! Dispatcher's job

// ❌ WRONG: Dispatching events
el.dispatchEvent(new CustomEvent('reaction'))  // NO!

// ❌ WRONG: Reading state
const offset = state.get('slider', laneId).offset  // NO!
```

---

### 5. Delegator

**File:** `delegator.js` (uses `buildPayload.js`, solvers, `dispatcher.js`)

#### Responsibilities
- Receive structured intents from `intentDeriver`
- Call `buildPayload()` to create descriptor arrays (snapshots of state)
- Route each descriptor to the appropriate solver based on `swipeType` and `type`
- Merge solver output back into the descriptor
- Forward final descriptor to `dispatcher.handle()`

#### Allowed Knowledge
- Intent structure (type, target, delta, axis, pressCancel)
- Solver registry (carousel, slider, drag)
- Descriptor fields
- The solver function to call (by swipeType + type key)

#### Forbidden Knowledge
- ❌ Direct state access or mutation
- ❌ DOM queries or mutation
- ❌ Policy functions
- ❌ Commit/revert decision logic
- ❌ Delta clamping or transformation
- ❌ Vue reactivity

#### Correct Usage Example
```javascript
// delegator.js - routing to solver and dispatcher
function forwardPacket(reactions) {
  for (const reaction of reactions) {
    const solverfn = solvers[reaction.swipeType]?.[reaction.type]
    if (solverfn) {
      const result = solverfn(reaction)
      Object.assign(reaction, result)
    }
    dispatcher.handle(reaction)
  }
}
```

#### Violation Examples
```javascript
// ❌ WRONG: Doing math
const clamped = Math.min(max, delta)  // NO! Solver's job

// ❌ WRONG: Accessing state
const value = state.get('slider', laneId).value  // NO! buildPayload's job

// ❌ WRONG: Mutating DOM
el.setAttribute('data-swiping', true)  // NO! Dispatcher's job
```

---

### 6. buildPayload

**File:** `buildPayload.js` (uses `stateManager.js`)

#### Responsibilities
- Create descriptor arrays from intent data
- Snapshot current state values via `stateManager` read-only getters
- Attach `laneSize`, `position`, and `constraints` to descriptors
- Handle `pressCancel` as a side-effect descriptor
- Return an array of descriptors (primary + optional pressCancel)

#### Allowed Knowledge
- Intent structure (type, target, delta, axis, pressCancel)
- State getters: `state.getSize()`, `state.getPosition()`, `state.getConstraints()`
- Target metadata (laneId, swipeType, element)

#### Forbidden Knowledge
- ❌ State mutation
- ❌ Solver or policy logic
- ❌ DOM mutation or queries
- ❌ Commit/revert decisions
- ❌ Delta clamping

#### Correct Usage Example
```javascript
// buildPayload.js - creating a descriptor
reactions.push({
  type: result.type,
  element: current.element,
  delta: result.delta,
  axis: result.axis,
  laneId: current.laneId,
  swipeType: current.swipeType,
  laneSize: state.getSize(current.swipeType, current.laneId),
  position: state.getPosition(current.swipeType, current.laneId),
  constraints: state.getConstraints(current.swipeType, current.laneId)
})
```

#### Violation Examples
```javascript
// ❌ WRONG: Mutating state
state.ensure('slider', laneId)  // NO! Vue components do this at init

// ❌ WRONG: Clamping values
const clamped = Math.max(min, delta)  // NO! Solver's job

// ❌ WRONG: Making decisions
if (delta > threshold) type = 'swipeCommit'  // NO!
```

---

### 7. Solver Layer

**Files:** `carouselSolver.js`, `sliderSolver.js`, `dragSolver.js`

#### Responsibilities
- Receive descriptors from the delegator
- Use policy functions for all pure math
- Augment descriptors with computed values (`reaction`, `direction`, resolved `delta`)
- Decide commit vs revert (carousel only)
- Convert pixel deltas to logical values (slider)
- Clamp 2D positions (drag)

#### Allowed Knowledge
- Descriptor contents (`delta`, `laneSize`, `position`, `constraints`, `axis`)
- Policy function results
- Reaction type names (`swipeStart`, `swipe`, `swipeCommit`, `swipeRevert`)

#### Solver Mutation Rules

Solvers may mutate descriptor fields **only if**:
- The descriptor is frame-local (created fresh by `buildPayload`)
- The mutation represents a resolved/computed value (never raw input)
- The descriptor is never reused after dispatch

#### Forbidden Knowledge
- ❌ Direct state access (`state.ensure()`, `state.get()`, etc.)
- ❌ DOM access
- ❌ Event dispatch
- ❌ Vue reactivity or imports
- ❌ DO NOT store or cache descriptors
- ❌ DO NOT assume descriptor fields persist across stages

#### Correct Usage Examples

**Carousel** — commit vs revert:
```javascript
swipeCommit(desc) {
  const { delta, axis, laneSize } = desc
  const clampedDelta = clampDelta(delta, laneSize)

  if (shouldCommit(clampedDelta, laneSize, axis)) {
    const direction = resolveDirection(clampedDelta, axis)
    const targetOffset = getCommitOffset(direction, laneSize)
    desc.reaction = desc.type
    desc.direction = direction
    desc.delta = targetOffset
    return desc
  }
  desc.reaction = 'swipeRevert'
  return desc
}
```

**Slider** — pixel to logical conversion:
```javascript
swipeCommit(desc) {
  const { delta, laneSize, position, constraints } = desc
  const { min, max } = constraints
  const deltaLogical = (delta / laneSize) * (max - min)
  const finalValue = Math.max(min, Math.min(max, position + deltaLogical))
  desc.delta = finalValue
  desc.reaction = desc.type
  return desc
}
```

**Drag** — 2D clamped position:
```javascript
swipeCommit(desc) {
  const { delta, constraints, position } = desc
  const finalPos = clampCommitPosition(delta, position, constraints)
  desc.reaction = desc.type
  desc.delta.x = finalPos.x
  desc.delta.y = finalPos.y
  return desc
}
```

#### Violation Examples
```javascript
// ❌ WRONG: Accessing state directly
const value = state.getValue('slider', desc.laneId)  // NO!

// ❌ WRONG: Mutating state
sliderState.sliders[laneId].value = newValue  // NO!

// ❌ WRONG: Calling ensure
const lane = state.ensure('carousel', laneId)  // NO!

// ❌ WRONG: DOM access
document.querySelector(`[data-lane="${laneId}"]`)  // NO!
```

---

### 8. Policy Layer (Pure Logic)

**Files:** `carouselPolicy.js`, `sliderPolicy.js`, `dragPolicy.js`

#### Responsibilities
- Contain **ONLY** pure functions (no side effects of any kind)
- Clamp deltas to bounds (1D and 2D)
- Resolve direction from delta and axis
- Determine commit thresholds
- Calculate commit offsets
- Clamp final positions to constraints

#### Allowed Knowledge
- Function parameters only (delta, laneSize, position, constraints, axis, etc.)
- Configuration constants from `APP_SETTINGS` (read-only)

#### Forbidden Knowledge
- ❌ State (reactive or otherwise)
- ❌ DOM
- ❌ Any side effects (logging, mutation, events)
- ❌ Imports from state modules
- ❌ Imports from Vue

#### Correct Usage Examples
```javascript
// carouselPolicy.js - pure math
export function clampDelta(delta, laneSize) {
  if (!laneSize) return delta
  return Math.max(-laneSize, Math.min(laneSize, delta))
}

export function shouldCommit(delta, laneSize, axis) {
  if (!laneSize) return false
  const axisBias = axis === 'vertical' ? 0.65 : 1
  const threshold = laneSize * APP_SETTINGS.swipeCommitRatio * axisBias
  return Math.abs(delta) >= threshold
}

// dragPolicy.js - 2D clamping
export function clampDelta2D(delta, position, constraints) {
  const { minX, maxX, minY, maxY } = constraints
  const clampedX = clampDelta(position.x + delta.x, minX, maxX)
  const clampedY = clampDelta(position.y + delta.y, minY, maxY)
  return { x: clampedX - position.x, y: clampedY - position.y }
}
```

#### Violation Examples
```javascript
// ❌ WRONG: Importing state
import { carouselState } from '../../state/carouselState'  // NO!

// ❌ WRONG: Reading reactive values
const value = carouselState.lanes[laneId].value  // NO!

// ❌ WRONG: Side effects
console.log('Clamping...')  // NO! (even logging)
element.style.transform = ...  // NO!
```

---

### 9. Dispatcher

**File:** `dispatcher.js`

#### Responsibilities
- **Single choke point** for all side effects
- Route descriptors with a `reaction` field to `stateManager` mutation functions
- Set DOM attributes (`data-pressed`, `data-swiping`) based on descriptor type
- Dispatch `CustomEvent('reaction')` to the target element
- NO decision logic whatsoever

#### Allowed Knowledge
- Descriptor contents (type, reaction, swipeType, element, etc.)
- State mutation function names (`swipeStart`, `swipe`, `swipeCommit`, `swipeRevert`)
- DOM attribute names (`data-pressed`, `data-swiping`)

#### Forbidden Knowledge
- ❌ Commit/revert decision logic
- ❌ Delta clamping or computation
- ❌ Value conversion
- ❌ Policy functions
- ❌ Solver logic

#### Correct Usage Example
```javascript
// dispatcher.js - applying state and DOM updates
handle(descriptor) {
  // 1. Apply domain reaction to state
  if (descriptor.reaction) {
    state.swipeStart(swipeType, desc)  // or swipe, swipeCommit, swipeRevert
  }
  // 2. Apply DOM attributes
  typeHandlers[descriptor.type]?.(descriptor.element)
  // 3. Dispatch custom event to element
  dispatchEvent(descriptor.element, descriptor)
}
```

#### Violation Examples
```javascript
// ❌ WRONG: Decision logic
if (delta > threshold) {
  descriptor.reaction = 'commit'  // NO! Solver already decided
}

// ❌ WRONG: Math
const clamped = Math.min(max, delta)  // NO!

// ❌ WRONG: Choosing reaction type
descriptor.reaction = shouldCommit(delta) ? 'swipeCommit' : 'swipeRevert'  // NO!
```

---

### 10. State Layer

**Files:** `stateManager.js`, `carouselState.js`, `sliderState.js`, `dragState.js`, `sizeState.js`

#### Responsibilities
- Own **ALL** mutable truth (Vue `reactive()` stores)
- Expose read-only getters for `buildPayload` and Vue components
- Receive mutation calls exclusively from the dispatcher
- Apply solver-resolved values to state (the solver already decided what happens)
- Reset transient gesture state on commit/revert (offset → 0, dragging → false)
- May contain internal helper logic (e.g., `getNextIndex` in carouselState)

#### stateManager Facade

`stateManager.js` is a routing facade that delegates to type-specific stores:

| Method | Purpose | Called by |
|--------|---------|-----------|
| `getSize(type, laneId)` | Read lane pixel size | buildPayload |
| `getPosition(type, laneId)` | Read current logical position | buildPayload |
| `getConstraints(type, laneId)` | Read min/max bounds | buildPayload |
| `get(type, laneId)` | Read full lane state | Vue components |
| `ensure(type, laneId)` | Create lane if absent | Vue components (init only) |
| `setSize(type, laneId, v)` | Set lane pixel size | Vue components (resize) |
| `setCount(type, laneId, n)` | Set carousel scene count | Vue components |
| `setPosition(type, laneId, v)` | Finalize position (post-transition) | Vue components |
| `setConstraints(type, laneId, c)` | Set bounds | Vue components |
| `swipeStart(type, desc)` | Begin gesture | Dispatcher |
| `swipe(type, desc)` | Apply live offset | Dispatcher |
| `swipeCommit(type, desc)` | Commit gesture | Dispatcher |
| `swipeRevert(type, desc)` | Revert gesture | Dispatcher |

#### Allowed Knowledge
- Own state values (value/position, offset, dragging, bounds, index, count, etc.)
- Lane identifiers
- Internal helper functions (e.g., `getNextIndex`, `clampNumber`)

#### Forbidden Knowledge
- ❌ Descriptor building
- ❌ Target resolution
- ❌ DOM queries or mutation
- ❌ Input handling
- ❌ Solver logic (commit vs revert — already decided)
- ❌ Policy functions (except internal helpers like index math)

#### State Shape by Type

**Carousel** (`carouselState.lanes[laneId]`):
```javascript
{ index, count, offset, size, dragging, pendingDir }
```

**Slider** (`sliderState.sliders[laneId]`):
```javascript
{ value, offset, min, max, size, dragging }
```

**Drag** (`dragState.lanes[laneId]`):
```javascript
{ position: {x, y}, offset: {x, y}, size, dragging, minX, minY, maxX, maxY }
```

#### Correct Usage Example
```javascript
// carouselState.js - applying solver output
swipeCommit(desc) {
  const { direction, delta, laneId } = desc
  const lane = this.ensure(laneId)
  lane.pendingDir = direction
  lane.offset = delta
  lane.dragging = false
}

// sliderState.js - solver already computed final value
swipeCommit(desc) {
  const slider = this.ensure(desc.laneId)
  slider.value = desc.delta   // delta is already the final value
  slider.offset = 0
  slider.dragging = false
}
```

#### Violation Examples
```javascript
// ❌ WRONG: Decision logic
if (shouldCommit(delta, laneSize)) {  // NO! Solver already decided
  this.commit()
}

// ❌ WRONG: DOM access
const el = document.querySelector(`[data-lane="${laneId}"]`)  // NO!

// ❌ WRONG: Importing solvers
import { carouselSolver } from '../solvers/carouselSolver'  // NO!
```

---

### 11. Vue Components

**Files:** `SwipeCarousel.vue`, `SwipeSlider.vue`, `SwipeDrag.vue`, `InputElement.vue`

#### Responsibilities
- Declare gesture capability via `data-*` attributes on DOM elements
- Call `state.ensure()` and `state.setSize()` / `state.setConstraints()` **at initialization only**
- Read state via `state.get()` for rendering (computed properties)
- Map logical values to pixel positions via CSS `translate3d()`
- Apply transitions (disable during drag, enable during animation)
- Listen for `reaction` CustomEvents from the dispatcher
- Emit Vue events to parent components when appropriate
- Observe resize and update lane size via `ResizeObserver`

#### Initialization Contract
- `state.ensure()` — called via `watchEffect` to lazily create lane state
- `state.setSize()` — called from `ResizeObserver` callback
- `state.setCount()` — called when scene list changes (carousel)
- `state.setConstraints()` — called from `ResizeObserver` callback (drag)
- `state.setPosition()` — called from `transitionend` handler (carousel post-animation)
- **After initialization, Vue is strictly read-only with respect to gesture state.**

#### Allowed Knowledge
- Lane state via computed properties (`state.get()`)
- Own DOM element dimensions
- CSS transform syntax (`translate3d`)
- Transition timing / animation
- `reaction` event details

#### Forbidden Knowledge
- ❌ Gesture math (delta computation, pixel-to-logical conversion)
- ❌ Clamping logic
- ❌ Commit/revert decisions
- ❌ Policy or solver internals
- ❌ Other components' state
- ❌ Direct input event handling (`pointerdown`, `pointermove`, etc.)

#### Correct Usage Examples
```javascript
// SwipeSlider.vue - mapping logical value to pixel position
const thumbStyle = computed(() => {
  const { min, max } = laneConstraints.value
  const range = max - min || 1
  const ratio = (lanePosition.value - min) / range
  const pos = ratio * laneSize.value + laneOffset.value

  return {
    transform: horizontal.value
      ? `translate3d(${pos}px,0,0)`
      : `translate3d(0,${pos}px,0)`,
    transition: dragging.value ? 'none' : 'transform 150ms ease-out',
    willChange: 'transform'
  }
})

// SwipeDrag.vue - combining position and offset
const itemStyle = computed(() => {
  const x = (lanePosition.value?.x ?? 0) + (offset.value?.x ?? 0)
  const y = (lanePosition.value?.y ?? 0) + (offset.value?.y ?? 0)
  return {
    transform: `translate3d(${x}px, ${y}px, 0)`,
    transition: dragging.value ? 'none' : 'transform 180ms ease-out'
  }
})

// SwipeCarousel.vue - ensuring state on init
watchEffect(() => {
  state.setCount('carousel', props.lane, props.scenes.length)
})
```

#### Violation Examples
```javascript
// ❌ WRONG: Doing gesture math
const newPos = startPos.x + (event.clientX - gestureStart.x)  // NO!

// ❌ WRONG: Clamping
const clamped = Math.max(min, Math.min(max, value))  // NO!

// ❌ WRONG: Commit decision
if (velocity > threshold) commit()  // NO!

// ❌ WRONG: Direct input handling
el.addEventListener('pointermove', handleMove)  // NO!

// ❌ WRONG: Importing solvers/policy
import { shouldCommit } from '../solvers/policy/carouselPolicy'  // NO!
```

---

## Descriptor Contract

Descriptors are the data packets that flow through the pipeline. They are created by `buildPayload`, augmented by solvers, and consumed by the dispatcher.

### Lifecycle
1. **Created** by `buildPayload` — snapshot of state at intent time
2. **Augmented** by a solver — adds `reaction`, `direction`, resolved `delta`
3. **Consumed** by `dispatcher` — applied to state and DOM
4. **Discarded** — never reused

### Required Fields (from buildPayload)
```typescript
interface Descriptor {
  type: 'press' | 'pressRelease' | 'pressCancel' | 'swipeStart' | 'swipe' | 'swipeCommit'
  element: HTMLElement
  delta: number | { x: number, y: number }
  axis: 'horizontal' | 'vertical' | 'both' | null
  laneId: string | null
  swipeType: 'carousel' | 'slider' | 'drag' | null
  laneSize: number | null
  position: number | { x: number, y: number } | null
  constraints: { min: number, max: number }
             | { minX: number, maxX: number, minY: number, maxY: number }
             | null
}
```

### Solver-Added Fields
```typescript
interface SolverAugmentation {
  reaction: string        // state action: 'swipeStart' | 'swipe' | 'swipeCommit' | 'swipeRevert'
  direction?: string      // 'left' | 'right' | 'up' | 'down' (carousel/drag commit)
  delta: number | { x: number, y: number }  // may be overwritten with resolved value
}
```

### Mutation Rules
- **buildPayload** creates descriptors — they are snapshots, not live references
- **Solvers** may overwrite `delta`, and must set `reaction` (and optionally `direction`)
- **Dispatcher** reads descriptors — never mutates them
- **State** reads descriptor fields — never mutates the descriptor
- **No stage** may cache or reuse a descriptor across frames

---

## DO NOT Rules (Summary)

### Input Layer (`inputSource.js`)
- DO NOT compute deltas
- DO NOT reference gesture phase
- DO NOT import state or DOM registry

### IntentDeriver (`intentDeriver.js`)
- DO NOT access lane state (value, offset, bounds)
- DO NOT clamp or transform deltas
- DO NOT make commit/revert decisions
- DO NOT import state modules

### IntentUtils (`intentUtils.js`)
- DO NOT read lane state (value, offset, dragging)
- DO NOT mutate DOM
- DO NOT make commit/revert decisions

### DOM Registry (`domRegistry.js`)
- DO NOT mutate DOM
- DO NOT dispatch events
- DO NOT read any application state

### Delegator (`delegator.js`)
- DO NOT access state directly
- DO NOT do math or clamping
- DO NOT mutate DOM

### buildPayload (`buildPayload.js`)
- DO NOT mutate state
- DO NOT call `state.ensure()`
- DO NOT clamp or compute values

### Policy Layer (`*Policy.js`)
- DO NOT import state or Vue
- DO NOT have side effects (including logging)
- DO NOT access DOM

### Solver Layer (`*Solver.js`)
- DO NOT access state directly
- DO NOT call `state.ensure()`
- DO NOT dispatch events
- DO NOT access DOM
- DO NOT import Vue

### Dispatcher (`dispatcher.js`)
- DO NOT contain decision logic
- DO NOT do math or clamping
- DO NOT call policy functions

### State Layer (`*State.js`, `stateManager.js`)
- DO NOT make commit/revert decisions
- DO NOT access DOM
- DO NOT build descriptors
- DO NOT import solvers or policy (except internal helpers)

### Vue Components
- DO NOT do gesture math
- DO NOT clamp values
- DO NOT handle input events directly
- DO NOT access solver/policy internals
- DO NOT mutate gesture state after initialization

---

## For AI Assistants

When modifying this codebase:

1. **Identify the layer** before making changes. Use the file list and diagram above.
2. **Check the contract** for that layer's allowed and forbidden knowledge.
3. **Never add imports** that violate layer boundaries (e.g., state into solver, solver into dispatcher).
4. **When in doubt**, keep logic in the lower layer:
   - Math → policy
   - Decisions → solver
   - Mutations → state (via dispatcher)
   - Rendering → Vue component
5. **Pure functions are sacred** — policy files must remain free of side effects, including logging.
6. **Descriptors flow down** — never pass reactive state through the pipeline. `buildPayload` snapshots everything.
7. **State reads are layered**:
   - `buildPayload` reads via `stateManager` getters → produces descriptors
   - Vue components read via `state.get()` → produces computed properties
   - Solvers **never** read state — they receive everything via descriptors
8. **`state.ensure()` is Vue-only** — only called during component initialization. Never from solvers, delegator, or dispatcher.
9. **Descriptor lifecycle**: created → augmented → dispatched → discarded. Never cached.

If a feature requires knowledge from a forbidden source, the architecture may need extension, not violation. Consult this contract before proceeding.

---

## Version History

| Date | Change |
|------|--------|
| 2026-02-07 | Initial contract formalization |
| 2026-02-09 | Rewrite for refactored pipeline (intentDeriver, delegator, buildPayload) |
