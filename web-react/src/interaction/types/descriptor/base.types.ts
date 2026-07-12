import type { Axis, Axis1D, Axis2D, InteractionType, BoxSide, Size2D, Vec2 } from '@typing/core.types'


export interface BaseInteraction {
  readonly pointerId: number
  readonly element: HTMLElement
  readonly id: string
  readonly actionId?: string
}
export interface LayoutData {
  readonly deviceSize: Size2D
  readonly frameRect: FrameSnapshot
  readonly grabOffset: Vec2
  readonly containerSize: Size2D
  readonly itemSize: Size2D
}

export type BaseWithSwipe =
  BaseInteraction & {
    readonly layout: LayoutData
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
  // width: number
  // height: number
}

export interface Capabilities {
  readonly isPressable: boolean
  readonly isSwipeable: boolean
  readonly isInstantSwipe: boolean
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
  readonly overflowSide: BoxSide | null
}