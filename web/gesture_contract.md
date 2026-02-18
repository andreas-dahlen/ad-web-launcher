**Gesture Contract**

- System converts pointer down/move/up into gesture objects consumed by Vue state/render layers. Gesture lifecycle: IDLE → PENDING → SWIPING → swipeCommit or pressRelease → reset.
- Common payload fields (flattened descriptor):
type, element, swipeType, axis, laneId, delta?, direction?, actionId?, laneSize?, position?, constraints?, reactions?, extra?
- Targets resolved from DOM data-* attributes (data-lane, data-axis, data-swipe-type, optional data-action). Reactions auto-derived (press, swipeStart, swipe, swipeCommit, swipeRevert, pressRelease, pressCancel, select/deselect).


### Resolved target fields (present on all gestures)
These fields are resolved on pointer down.
They may be re-evaluated on swipeStart only if the gesture captures a different target.
They are flattened directly onto the gesture descriptor.

```js
{
  element,           // DOM element
  laneId,            // string | null
  axis,              // 'horizontal' | 'vertical' | 'both' | null
  swipeType,         // 'carousel' | 'slider' | 'drag' | null
  actionId,          // string | null (from data-action)
  laneSize,          // number | {width,height} | null
  position,          // number | {x,y} | null (committed state)
  constraints,       // {min,max} | {minX,maxX,minY,maxY} | null
  reactions          // booleans for supported gesture types
}
```

### Lifecycle and transitions
- IDLE → (pointer down) → PENDING. Emits press immediately if target supports press.
- PENDING → (move surpasses threshold) → SWIPING. Emits swipeStart (may include extra pressCancel). Axis chosen by dominant movement; must be supported by target.
- SWIPING → (move) → swipe.
- SWIPING → (pointer up) → swipeCommit (represents pointer release after swipe; solvers decide commit vs revert semantics).
- PENDING → (pointer up without swipe) → pressRelease.
- After swipeCommit or pressRelease, interpreter resets to IDLE.
- swipeCommit and pressRelease always terminate the active gesture lifecycle. Interpreter must return to IDLE before processing new gestures.
- Axis is resolved and locked at swipeStart. It must not change for the remainder of the gesture lifecycle.

### Coordinate Spaces
The gesture system operates in two coordinate spaces:

1. Viewport CSS Pixel Space (raw input)
   - Pointer movement in rendered CSS pixels.
   - Used by: press, pressRelease, pressCancel, swipeStart.

2. Logical Device Space (normalized)
   - Computed as: normalizedDelta = rawDelta / scale.
   - Represents movement in logical device pixels (design space),
     independent of viewport scaling.
   - Used by: swipe, swipeCommit, swipeRevert.
   - All solver math and constraint logic operates in this space.
   - Normalization is applied by the interpreter when emitting swipe and swipeCommit. Solvers operate exclusively in logical device space.

### Delta semantics
- Raw deltas: press, pressRelease, pressCancel, swipeStart use raw screen coords resolved to axis:
  - carousel/slider: number (x or y).
  - drag: { x, y }.
  Normalized deltas:
- swipe, swipeCommit, swipeRevert use deltas divided by the current viewport scale.
- Normalized values represent movement in logical device pixels (design space),
  independent of viewport scaling.
  - carousel/slider: number; drag: { x, y }.
- Thresholds:
  - Swipe start threshold: APP_SETTINGS.swipeThresholdRatio * min(viewWidth, viewHeight) in CSS px.
  - Carousel commit uses APP_SETTINGS.swipeCommitRatio with axis bias (vertical *0.65); slider/drag always commit.
- Constraints:
  - drag: deltas clamped to {minX,maxX,minY,maxY}; swipe returns cumulative normalized delta from swipeStart. swipeCommit returns absolute final position in logical space.
  - slider: swipe clamped to usable pixel range; commit converts pixel delta to logical value within [min,max].
  - carousel: swipe clamped to ±laneSize; commit snaps to full lane offset or reverts.

### Gesture types
```js
// Press down (immediate)
{...targetInfo,
 type: 'press', 
 delta: { x, y }  
 }

// Pointer up with no swipe
{ ...targetInfo, 
type: 'pressRelease', 
delta: { x, y }
}

// Cancel prior press when swipe steals focus (only as swipeStart.extra)
{ ...targetInfo, 
type: 'pressCancel', 
delta: { x, y } 
}//this is original targetInfo

// Swipe starts after threshold
{ ...targetInfo,
  type: 'swipeStart',
  delta,            // raw axis-resolved (number or {x,y})

  extra: pressCancelEvent | null
}

// Continuous swipe/drag
{  ...targetInfo,
type: 'swipe',
  delta           // normalized total (number or {x,y})
}

// Commit at pointer up (may be converted to swipeRevert by solver)
{  ...targetInfo,
type: 'swipeCommit',
  delta,            // normalized total
  direction        // optional, set by solvers
}

// Revert (carousel only, emitted instead of swipeCommit when below commit threshold)
{ ...targetInfo,
  type: 'swipeRevert',
  delta            // normalized total
}
```
## Gesture Augmentation Rules
- Interpreter creates the base gesture object.
- Solvers may augment or override fields (e.g., delta, direction).
- Solvers may convert swipeCommit → swipeRevert.
- Base structural fields (type, swipeType, laneId, axis) must remain present.
- Solvers may change type only when converting swipeCommit → swipeRevert.
- Solvers return augmentation patches.
- The pipeline is responsible for merging them into the active descriptor.
- The final merged gesture is dispatched to renderer and stateManager.
- Gestures are mutable only during pipeline processing. After solution is merge with descriptor, the descriptor must be treated as immutable.

### Solver augmentations
- carousel: swipeStart marks dragging; swipe clamps delta; swipeCommit adds direction and snaps delta to full lane or changes type to swipeRevert if below threshold.
- slider: swipe clamps pixel offset; swipeCommit converts to logical value within [min,max].
- drag: swipe clamps relative offset within constraints; swipeCommit returns absolute position and direction (dominant axis).

### Renderer and Vue consumption
- render.handle sets data-pressed / data-swiping on target element and dispatches CustomEvent('reaction', { detail: gesture }).
- Components use usePointerForwarding to send pointer events to pipeline and optionally listen for reaction to emit Vue events.
- Reactive state via stateManager:
  - carousel lanes: { index, count, offset, size, dragging, pendingDir }.
  - slider lanes: { value, offset, min, max, size, dragging }.
  - drag lanes: { position:{x,y}, offset:{x,y}, size, constraints, dragging }.
- Renderer/state hooks:
  - carousel swipeCommit triggers CSS transition; transitionend calls setPosition to finalize index.
  - drag/slider apply offsets directly to transforms; transitions disabled while dragging.
- Sizing adapters (ResizeObserver):
  - useCarouselSizing sets lane size (width/height).
  - useSliderSizing sets usable track length minus thumb.
  - useDragSizing sets container minus item size and constraints.

### Examples
```js
// press on slider thumb
{ type: 'press', swipeType: 'slider', axis: 'horizontal', laneId: 'volume', delta: { x: 120, y: 300 } }

// pressRelease with no swipe
{ type: 'pressRelease', swipeType: 'slider', laneId: 'volume', delta: { x: 122, y: 302 } }

// swipeStart with pressCancel (fallback lane capture)
{
  type: 'swipeStart',
  swipeType: 'carousel',
  axis: 'horizontal',
  laneId: 'main',
  delta: 14,                // raw px along axis
  extra: { type: 'pressCancel', delta: { x: 140, y: 280 }, swipeType: 'carousel', laneId: 'main' }
}

// swipe (carousel)
{ type: 'swipe', swipeType: 'carousel', laneId: 'main', delta: 0.18, laneSize: 420 }

// swipeCommit commit (carousel)
{ type: 'swipeCommit', swipeType: 'carousel', laneId: 'main', delta: 1, direction: 'left' }

// swipeRevert (carousel, threshold not met)
{ type: 'swipeRevert', swipeType: 'carousel', laneId: 'main', delta: 0.2 }

// swipe (drag)
{ type: 'swipe', swipeType: 'drag', laneId: 'avatar', delta: { x: 40, y: -10 }, constraints: { minX:0,maxX:200,minY:0,maxY:100 } }

// swipeCommit (drag)
{ type: 'swipeCommit', swipeType: 'drag', laneId: 'avatar', delta: { x: 160, y: 30 }, direction: 'right' }

// swipeCommit (slider)
{ type: 'swipeCommit', swipeType: 'slider', laneId: 'volume', delta: 72, constraints: { min: 0, max: 100 } }
```

### Usage notes
- Gestures are objects; consumers should not rely on DOM state beyond targetInfo.
- For swipeStart, consume optional extra before handling the new swipe target.
- delta in swipe and swipeCommit is already normalized; apply lane sizes/constraints from targetInfo or stateManager as needed.
- Always ensure lanes are created and sized (state.ensure + sizing adapters) before handling gestures to avoid null laneSize/constraints.

### Non-Negotiable Invariants

- Axis is locked at swipeStart and never changes.
- intent layer never performs clamping, snapping, or threshold commit logic.
- Solvers are the only layer allowed to reinterpret delta meaning.
- Only solvers may convert swipeCommit → swipeRevert.
- stateManager is the only writer of reactive state.
- No descriptor mutation after solvers.
- Carousel may revert; slider and drag never revert.
- TargetInfo.axis represents supported axis; lockedAxis represents the resolved gesture axis.