import type { Descriptor } from '@interaction/types/descriptor/descriptor'
import type { EventBridgeType } from '@interaction/types/primitiveType'
import type { CarouselStore } from '@interaction/stores/carouselState'
import type { DragStore } from '@interaction/stores/dragState'
import type { SliderStore } from '@interaction/stores/sliderState'

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