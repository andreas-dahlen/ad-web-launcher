import type { Descriptor } from '@interaction/types/descriptor/descriptor'
import type { EventBridgeType } from '@interaction/types/primitiveType'
import type { CarouselStore } from '@interaction/stores/carouselStore'
import type { DragStore } from '@interaction/stores/dragStore'
import type { SliderStore } from '@interaction/stores/sliderStore'

/* =====================
   Pointer bridge input
======================== */
export interface PointerEventPackage {
  readonly eventType: EventBridgeType
  readonly x: number
  readonly y: number
  readonly pointerId: number
}

/* =========================================================
   Interpreter bridge
========================================================= */

export type InterpreterFn = (x: number, y: number, pointerId: number) => Descriptor | null


/* =========================================================
   Store mutation typing
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