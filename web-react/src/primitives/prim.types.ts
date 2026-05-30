import type { CtxType } from '@interaction/types/ctx.types'
import type { Axis1D, OnEdgeDir } from '@typing/core.types'
import type { BaseProps, DataAttributes } from '@typing/propUtils.types'

//discriminating unions - capabilities
export type SnapConfig = //default is false
  | {
    useSettingsSnap: true
    snapX?: never
    snapY?: never
  }
  | {
    useSettingsSnap?: false
    snapX?: number
    snapY?: number
  }

export type CarouselSceneProps =
  | { scenes: React.ComponentType[]; sceneCount?: never }
  | { sceneCount: number; scenes?: never }

export type OverflowProps =
  | { onEdgeDir: OnEdgeDir; isInitialVisible: boolean }
  | { onEdgeDir: never; isInitialVisible: never }

//domain layer
export type DragProps = BaseProps & SnapConfig & {
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: CtxType) => void
}

export type CarouselProps = BaseProps & CarouselSceneProps & {
  axis: Axis1D
  lockPrevAt?: number
  lockNextAt?: number
  carouselDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: CtxType) => void
}

export type SliderProps = BaseProps & {
  axis: Axis1D
  instantSwipe?: boolean
  trackClassName?: string
  thumbClassName?: string
  children?: React.ReactNode
  sliderDataAttrs?: DataAttributes
  onValueChange?: (value: number) => void
}

export type ScrollProps = BaseProps & OverflowProps & {
  axis: Axis1D
  instantSwipe?: boolean
  children?: React.ReactNode
  scrollDataAttrs?: DataAttributes
}

export type ButtonProps = BaseProps & {
  action?: string
  children?: React.ReactNode
  buttonDataAttrs?: DataAttributes
  onPressRelease?: (detail: CtxType) => void
}