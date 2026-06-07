import type { FrameSnapshot } from '@interaction/types/base.types'
import type { ComputedPackage, ScrollComputed, SliderComputed } from '@interaction/types/computed.types'
import type { CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types'
import type { Direction, Vec2 } from '@typing/core.types'
import type { Runtime } from '@interaction/types/runtime.types'


type StoreEffect<T> =
  {
    routing: 'store'
    solv: T
  }

type RevertEffect =
  {
    routing: 'replace-event'
    event: "swipeRevert"
  }

/*
---------
CAROUSEL
---------
*/
export type CarouselSolver = {
  swipe(r: Runtime, d: CarouselDesc): StoreEffect<CarouselSwipePayload> | null
  swipeCommit(r: Runtime, d: CarouselDesc): StoreEffect<CarouselSwipeCommitPayload> | RevertEffect
}

export type CarouselSwipePayload = {
  delta1D: number
}
export type CarouselSwipeCommitPayload = {
  delta1D: number
  direction: Direction
}

/*
---------
SLIDER
---------
*/
export type SliderSolver = {
  press(r: Runtime, d: SliderDesc): StoreEffect<SliderPressPayload>
  swipeStart(r: Runtime, d: SliderDesc): StoreEffect<SliderSwipeStartPayload>

  swipe(r: Runtime, d: SliderDesc, c: SliderComputed): StoreEffect<SliderSwipePayload> | null
  swipeCommit(r: Runtime, d: SliderDesc, c: SliderComputed): StoreEffect<SliderSwipeCommitPayload> | null
}
export type SliderPressPayload = {
  delta1D: number
}
export type SliderSwipeStartPayload = {
  delta1D: number
  computedUpdate: ComputedPackage
}
export type SliderSwipePayload = {
  delta1D: number
}
export type SliderSwipeCommitPayload = {
  delta1D: number
}
/*
---------
DRAG
---------
*/
export type DragSolver = {
  swipeStart(r: Runtime, d: DragDesc): StoreEffect<DragSwipeStartPayload>
  swipe(r: Runtime, d: DragDesc): StoreEffect<DragSwipePayload>
  swipeCommit(r: Runtime, d: DragDesc): StoreEffect<DragSwipeCommitPayload>
}

export type DragSwipeStartPayload = {
  frameRect: FrameSnapshot
}
export type DragSwipePayload = {
  delta: Vec2
}
export type DragSwipeCommitPayload = {
  delta: Vec2
}

/*
---------
Scroll
---------
*/

export type ScrollSolver = {
  swipeStart(r: Runtime, d: ScrollDesc): StoreEffect<ScrollSwipeStartPayload | ScrollOverflowSwipeStartPayload>

  swipe(r: Runtime, d: ScrollDesc, c: ScrollComputed): StoreEffect<ScrollSwipePayload | ScrollOverflowSwipePayload>

  swipeCommit(r: Runtime, d: ScrollDesc, c: ScrollComputed): StoreEffect<ScrollSwipeCommitPayload | ScrollOverflowSwipeCommitPayload> | (RevertEffect & { solv: ScrollOverflowSwipeRevertPayload })
}

export type ScrollSwipeStartPayload = {
  computedUpdate: ComputedPackage
  delta1D: number
  isOverflow: false
}
export type ScrollOverflowSwipeStartPayload = {
  computedUpdate: ComputedPackage
  overflowValue: number
  isOverflow: true
}


export type ScrollSwipePayload = {
  delta1D: number
  isOverflow: false
}

export type ScrollOverflowSwipePayload = {
  overflowValue: number
  isOverflow: true
}

export type ScrollSwipeCommitPayload = {
  isVisible: true
  delta1D: number
  isOverflow: false
}

export type ScrollOverflowSwipeCommitPayload = {
  isVisible: boolean
  overflowValue: number
  isOverflow: true
}
export type ScrollOverflowSwipeRevertPayload = {
  isVisible: boolean
  overflowValue: number
}





// export type ScrollSolution = | {
//   storeAccepted: false
// } | {
//   storeAccepted: true
//   delta1D?: number
//   overflowValue?: number
//   isVisible?: boolean
//   computedUpdate?: ComputedPackage
//   event?: 'swipeRevert'
// }
// export type DragSolution = DragSolutionBase & DragSolutionSwipeStart
// export type DragSolutionSwipeStart = DragSolutionBase & {
//   frameRect: FrameSnapshot
// }
// export type DragSolutionBase = {
//   storeAccepted: true
//   delta: Vec2
// }
// export type SliderSolution = | {
//   storeAccepted: false
// } | {
//   storeAccepted: true
//   delta1D: number
//   computedUpdate?: ComputedPackage
// }
// export type CarouselSolution = | {
//   storeAccepted: false
// } | {
//   storeAccepted: true
//   delta1D: number
//   direction?: Direction
//   event?: 'swipeRevert'
// }





