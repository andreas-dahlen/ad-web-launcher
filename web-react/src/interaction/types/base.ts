import type { Vec2, Axis, EventType, InteractionType } from "./primitives.ts"

export interface BaseInteraction {
  event: EventType
  pointerId: number
  element: HTMLElement
  id: string
  actionId?: string
}
export type BaseWithSwipe =
  BaseInteraction & {
    delta: Vec2
    axis: Axis
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
export interface Context {
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

export interface Builder {
  reactions: Reactions
  x: number
  y: number
  pointerId: number
  event: EventType
}