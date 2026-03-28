import type { Vec2, Axis, EventType, InteractionType } from "./primitives.ts"

export interface BaseInteraction {
  type: InteractionType
  event: EventType
  pointerId: number
  element: HTMLElement
  id: string
  actionId?: string
}
export type BaseWithSwipe<T extends 'carousel' | 'slider' | 'drag'> =
  (BaseInteraction & { type: T }) & {
    delta: Vec2
    axis: Axis | null
    baseOffset: Vec2
  }

export interface CancelData {
  element: HTMLElement
  pressCancel: boolean
}

export interface Reactions {
  pressable: boolean
  swipeable: boolean
  modifiable: boolean
}
export interface BaseContext {
  el: HTMLElement
  ds: DOMStringMap
  id: string
  axis: Axis | null
  type: InteractionType
  laneValid: boolean
  snapX: number | null
  snapY: number | null
  lockPrevAt: number | null
  lockNextAt: number | null
  locked: boolean
}
export type CarouselContext = BaseContext & {
  type: 'carousel'
}

export type SliderContext = BaseContext & {
  type: 'slider'
}

export type DragContext = BaseContext & {
  type: 'drag'
}

export type ButtonContext = BaseContext & {
  type: 'button'
}

export type Context =
  | CarouselContext
  | SliderContext
  | DragContext
  | ButtonContext

export interface Builder {
  reactions: Reactions
  x: number
  y: number
  pointerId: number
  event: EventType
}