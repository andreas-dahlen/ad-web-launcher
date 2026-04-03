import type { CtxButton, CtxSwipeType } from '@interaction/types/ctxType'
import type { Descriptor } from '@interaction/types/descriptor/descriptor'
import type { DataKeys, EventBridgeType, EventType } from '@interaction/types/primitiveType'
import type { CarouselStore } from '@interaction/zunstand/carouselState'
import type { DragStore } from '@interaction/zunstand/dragState'
import type { SliderStore } from '@interaction/zunstand/sliderState'

/* =====================
   Pointer bridge input
======================== */
export interface PointerEventPackage {
  eventType: EventBridgeType
  x: number
  y: number
  pointerId: number
}

/* =========================================================
   Interpreter bridge
========================================================= */

export type InterpreterFn = (x: number, y: number, pointerId: number) => Descriptor | null

/* =========================================================
   Solver typing
========================================================= */

export type solverFn = (desc: Descriptor) => CtxPartial
export type SolverMap = Partial<Record<DataKeys, Partial<Record<EventType, solverFn>>>>
export type CtxPartial = Partial<Exclude<CtxSwipeType, CtxButton>>
/* =========================================================
   State mutation typing
========================================================= */

export type EventMap = {
  carousel: ['swipe', 'swipeStart', 'swipeCommit', 'swipeRevert']
  slider: ['press', 'swipeStart', 'swipe', 'swipeCommit']
  drag: ['swipeStart', 'swipe', 'swipeCommit']
}
export type CarouselFunctions = Pick<
  CarouselStore,
  EventMap['carousel'][number]>

export type SliderFunctions = Pick<
  SliderStore,
  EventMap['slider'][number]>

export type DragFunctions = Pick<
  DragStore,
  EventMap['drag'][number]>