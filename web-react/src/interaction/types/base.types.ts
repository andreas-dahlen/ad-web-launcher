import type { Vec2, Axis, InteractionType, OnEdgeDir } from "../../shared/typing/core.types.ts"

export interface BaseInteraction {
  readonly pointerId: number
  readonly element: HTMLElement
  readonly id: string
  readonly actionId?: string
}
export type BaseWithSwipe =
  BaseInteraction & {
    readonly axis: Axis
    readonly grabOffset: Vec2
    readonly frame: FrameSnapshot
  }

export type ElSnapshots = {
  grabOffset: Vec2
  frame: FrameSnapshot
}

export interface FrameSnapshot {
  left: number
  top: number
  width: number
  height: number
}

export interface Capabilities {
  readonly pressable: boolean
  readonly swipeable: boolean
  readonly instantSwipe: boolean
}
export type DomMeta = Capabilities & {
  readonly el: HTMLElement
  readonly ds: DOMStringMap
  readonly id: string
  readonly axis: Axis | null
  readonly type: InteractionType
  readonly snapX: number | null
  readonly snapY: number | null
  readonly lockPrevAt: number | null
  readonly lockNextAt: number | null
  readonly onEdgeDir: OnEdgeDir | null
}