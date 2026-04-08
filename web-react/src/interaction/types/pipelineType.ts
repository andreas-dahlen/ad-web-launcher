import type { Descriptor } from '@interaction/types/descriptor/descriptor'
import type { CarouselStore } from '@interaction/stores/carouselStore'
import type { DragStore } from '@interaction/stores/dragStore'
import type { SliderStore } from '@interaction/stores/sliderStore'

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