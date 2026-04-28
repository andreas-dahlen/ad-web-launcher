import type { Descriptor } from '../descriptor/descriptor.ts'
import type { CarouselStore } from '../../stores/carouselStore.ts'
import type { DragStore } from '../../stores/dragStore.ts'
import type { SliderStore } from '../../stores/sliderStore.ts'
import type { DataKeys, EventType } from './primitiveType.ts'

/* =========================================================
   Interpreter bridge
========================================================= */

export type InterpreterFn = (x: number, y: number, pointerId: number) => Descriptor | null

/* =========================================================
   Store mutation typing
========================================================= */

// pipelineType.ts
const EVENT_MAP = {
  carousel: ['swipe', 'swipeStart', 'swipeCommit', 'swipeRevert'],
  slider: ['press', 'swipeStart', 'swipe', 'swipeCommit'],
  drag: ['swipeStart', 'swipe', 'swipeCommit'],
} as const satisfies Record<DataKeys, EventType[]>

// derive the type from the value
type EventMap = typeof EVENT_MAP

export const CAROUSEL_EVENTS = new Set<EventType>(EVENT_MAP.carousel)
export const SLIDER_EVENTS = new Set<EventType>(EVENT_MAP.slider)
export const DRAG_EVENTS = new Set<EventType>(EVENT_MAP.drag)

export type CarouselFunctions = Pick<
  CarouselStore,
  EventMap['carousel'][number]>

export type SliderFunctions = Pick<
  SliderStore,
  EventMap['slider'][number]>

export type DragFunctions = Pick<
  DragStore,
  EventMap['drag'][number]>