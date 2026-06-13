Yeah, now that I've seen interpreter.ts, gesture.utils.ts, domQuery.ts, and buildDesc.ts, I think you're in a good position to treat the interpreter as the unit under test and mock everything around it.

I would not spend much effort testing domMeta or domQuery through interpreter tests. Those should be assumed correct and mocked.

Using vi.spyOn(domQuery, 'findTargetInDom') and vi.spyOn(domQuery, 'findLaneInDom') is exactly what I'd do.

What interpreter actually owns

From what I've seen, interpreter is primarily responsible for:

1. Gesture lifecycle
idle
 -> pointerDown
 -> pending
 -> swiping
 -> finalize
 -> cleanup
2. State transitions
PENDING
SWIPING
removed
3. Event emission
press
swipeStart
swipe
swipeCommit
pressRelease
4. Descriptor switching
original target desc
    ->
lane desc

when swipe capture occurs.

Tests I'd prioritize
PointerDown creates gesture

Mock:

findTargetInDom -> descriptor

Assert:

gestures[pointerId] exists

and output:

press

(if interpreter emits one)

PointerDown ignored when no target

Mock:

findTargetInDom -> null

Assert:

returns null
gesture not stored

This catches a surprising amount of bugs.

Move below threshold stays pending

Mock:

findTargetInDom -> swipeable descriptor

Sequence:

down
move (small delta)

Assert:

state === PENDING
no swipeStart
Swipeable target enters swiping

Mock:

findTargetInDom -> swipeable slider

Sequence:

down
move beyond threshold

Assert:

swipeStart emitted
state === SWIPING
descriptor unchanged

This is probably the most important interpreter test.

Non-swipeable target captures lane

Mock:

findTargetInDom -> button
findLaneInDom -> lane descriptor

Sequence:

down
move beyond threshold

Assert:

swipeStart emitted
descriptor switched
state === SWIPING

This is the other huge one.

Non-swipeable target with no lane stays pending

Mock:

findTargetInDom -> button
findLaneInDom -> null

Sequence:

down
move beyond threshold

Assert:

still pending
no swipeStart

This is exactly the kind of regression that appears later.

Swiping emits swipe

Sequence:

down
threshold crossed
move again

Assert:

swipe

not

swipeStart
SwipeCommit finalizes and removes gesture

Sequence:

down
swipeStart
up

Assert:

swipeCommit
gesture removed
PressRelease path

Sequence:

down
up

without swiping

Assert:

pressRelease
gesture removed

This is probably the most common user interaction.

Capability guards

You already tested gestureUtils, but interpreter should still have lifecycle tests:

Non-pressable
down
up

returns:

null

or no output

depending on implementation.

Non-swipeable
down
move

should never enter swipe unless lane capture succeeds.

What I'd mock

I would isolate interpreter almost completely:

vi.spyOn(domQuery, 'findTargetInDom')
vi.spyOn(domQuery, 'findLaneInDom')
vi.spyOn(gestureUtils, 'swipeThresholdCalc')

For many tests:

swipeThresholdCalc.mockReturnValue(false)

or

swipeThresholdCalc.mockReturnValue(true)

so you don't care about coordinates at all.

Then your tests become:

down
move
up

and you control all branching through mocks.

That gives you tests focused on:

input event
    ->
state transition
    ->
interpreter output

which is exactly what interpreter owns according to the architecture you've been moving toward.