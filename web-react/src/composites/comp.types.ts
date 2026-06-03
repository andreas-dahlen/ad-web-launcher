

//composition layer


import type { SnapConfig } from '@primitives/prim.types'
import type { Axis1D, EventType } from '@typing/core.types'
import type { DataAttributes } from '@typing/propUtils.types'

export type DragFrameProps = SnapConfig & {
  id: string
  className?: string
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: EventType) => void
}


export type DragButtonProps = SnapConfig & {
  id: string
  action?: string
  className?: string
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  buttonDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: EventType) => void
  onPressRelease?: (detail: EventType) => void
}

export type DragSliderProps = SnapConfig & {
  id: string
  axis: Axis1D
  className?: string
  trackClassName?: string
  thumbClassName?: string
  children?: React.ReactNode
  sliderDataAttrs?: DataAttributes
  dragDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: EventType) => void
  onValueChange?: (value: number) => void
}

export type Teleporter = {
  children: React.ReactNode
  targetEl: HTMLElement
  toPortal: boolean
}