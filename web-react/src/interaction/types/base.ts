import type { Vec2, Axis, EventType, InteractionType } from "./primitives.ts"

export interface BaseInteraction {
  type: InteractionType
  event: EventType
  delta: Vec2
  pointerId: number
  element: HTMLElement
  id: string
  axis: Axis | null
  baseOffset: Vec2
  actionId?: string
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