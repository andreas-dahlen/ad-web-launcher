import type { Vec2, Axis, InteractionType, OnEdgeDir, Axis1D, Axis2D, Size2D } from "../../shared/typing/core.types.ts"

export interface BaseInteraction {
  readonly pointerId: number
  readonly element: HTMLElement
  readonly id: string
  readonly actionId?: string
}
export type BaseWithSwipe =
  BaseInteraction & {
    readonly layout: LayoutData
  }
export interface LayoutData {
  readonly deviceSize: Size2D
  readonly frameRect: FrameSnapshot
  readonly grabOffset: Vec2
  readonly containerSize: Size2D
  readonly itemSize: Size2D
}

export type BaseWithAxis1D = BaseWithSwipe & {
  axis: Axis1D
}
export type BaseWithAxis2D = BaseWithSwipe & {
  axis: Axis2D
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