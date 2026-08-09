# Interaction Engine — Test Coverage Checklist

## Input

* [x] `adapter/usePointerBridge.hook.ts`

  * [x] pointer down / move / up forwarding
  * [x] coordinates / pointer ID forwarding
  * [x] cleanup

* [x] `input/buildDesc.ts`

* [x] `input/domMeta.ts`

* [x] `input/domQuery.ts`

* [x] `input/gesture.utils.ts`

* [x] `input/interpreter.ts`

## Assertions

* [x] `assertions/assertions.ts`

  * [x] valid inputs
  * [x] invalid inputs
  * [x] expected failures / error messages

## Runtime

* [x] `runtime/pipeline.ts`
* [x] `runtime/solverRouter.ts`

  * [x] carousel
  * [x] slider
  * [x] drag
  * [x] scroll
  * [x] invalid / unknown type
  * [x] null solver result

## Solvers

### Carousel

* [x] `carouselSolver/carousel.solver.ts`
* [x] `carouselSolver/carousel.utils.ts`

Behavior:

* [x] swipe
* [x] commit
* [x] gated / locked movement
* [x] revert

### Drag

* [x] `dragSolver/drag.solver.ts`
* [x] `dragSolver/drag.utils.ts`

Behavior:

* [x] swipeStart
* [x] swipe
* [x] commit
* [x] constraints / edge cases

### Scroll

* [x] `scrollSolver/scroll.solver.ts`
* [ ] `scrollSolver/scroll.utils.ts` needs to be finished before testing
* [ ] `scrollSolver/overflow.utils.ts` needs to be finished before testing

Behavior:

* [x] normal swipe
* [x] normal commit
* [x] overflow swipe
* [x] overflow commit
* [x] overflow revert
* [ ] overflow edge cases

### Slider

* [x] `sliderSolver/slider.solver.ts`
* [x] `sliderSolver/slider.utils.ts`

Behavior:

* [x] swipeStart
* [x] swipe
* [x] commit
* [x] min/max clamping
* [ ] remaining edge cases

## Shared Solver Utilities

* [ ] `solvers/utils/axis.utils.ts`

  * [ ] horizontal
  * [ ] vertical
  * [ ] both
  * [ ] axis compatibility / locking
  * [ ] invalid combinations

* [ ] `solvers/utils/vector.utils.ts`

  * [ ] zero vectors
  * [ ] positive / negative values
  * [ ] vector operations
  * [ ] edge cases

## Updater

* [x] `updater/domUpdater.ts`

  * [ ] descriptor → DOM mutation
  * [ ] attributes
  * [ ] transforms / styles
  * [ ] computed updates
  * [ ] `reaction` event
  * [ ] null / invalid input
  * [ ] missing element

## State

* [x] Gesture store
* [x] Carousel store
* [x] Slider store
* [x] Drag store
* [x] Scroll store

## End-to-End Interaction Paths

* [ ] Carousel: `down → swipeStart → swipe → commit`
* [ ] Carousel: `down → swipe → revert`
* [ ] Slider: `down → swipeStart → swipe → commit`
* [ ] Drag: `down → swipeStart → swipe → commit`
* [ ] Scroll: normal interaction
* [ ] Scroll: overflow interaction
* [ ] Button: `down → pressRelease`
* [ ] Press cancellation when swipe begins
* [ ] Below-threshold movement remains pending
* [ ] Invalid / unsupported target produces no reaction

## Architecture Invariants

* [ ] Input layer does not mutate DOM
* [ ] Input layer does not perform solver clamping
* [ ] Interpreter owns gesture lifecycle
* [ ] Solvers own outcome / commit / revert decisions
* [ ] Solvers do not touch DOM
* [ ] `domUpdater` is the side-effect boundary
* [ ] Descriptors remain valid through the pipeline
* [ ] Slider / drag never revert
* [ ] Carousel may revert
* [ ] Scroll overflow behavior is isolated from normal scrolling

## Final Pass

* [ ] Run full test suite
* [ ] Run coverage report
* [ ] Inspect uncovered branches
* [ ] Add tests only for meaningful uncovered behavior
* [ ] No untested interaction-engine source files remain
