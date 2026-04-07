import type { Vec2, Axis, InteractionType } from "../primitiveType.ts"

export interface BaseInteraction {
  // event: EventType
  readonly pointerId: number
  readonly element: HTMLElement
  readonly id: string
  readonly actionId?: string
}
export type BaseWithSwipe =
  BaseInteraction & {
    readonly axis: Axis
    readonly baseOffset: Vec2
  }

export interface Reactions {
  readonly pressable: boolean
  readonly swipeable: boolean
  readonly modifiable: boolean
}
export interface Context {
  readonly el: HTMLElement
  readonly ds: DOMStringMap
  readonly id: string
  readonly axis: Axis | null
  readonly type: InteractionType
  readonly laneValid: boolean
  readonly snapX: number | null
  readonly snapY: number | null
  readonly lockPrevAt: number | null
  readonly lockNextAt: number | null
  readonly locked: boolean
}