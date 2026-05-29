import type { Axis1D, OnEdgeDir } from '@typeScript/core/primitiveType.ts'
import type { CtxType } from './descriptor/ctxType.ts'


// utility
export type DataAttributes = {
  [key: `${string}`]:
  string |
  number |
  boolean |
  undefined
}

//base
type BaseProps = {
  id: string
  className?: string
  interactive?: boolean
}

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

export type CarouselScenes =
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

export type CarouselProps = BaseProps & CarouselScenes & {
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

//composition layer

export type DragFrameProps = SnapConfig & {
  id: string
  className?: string
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: CtxType) => void
}


export type DragButtonProps = SnapConfig & {
  id: string
  action?: string
  className?: string
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  buttonDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: CtxType) => void
  onPressRelease?: (detail: CtxType) => void
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
  onSwipeCommit?: (detail: CtxType) => void
  onValueChange?: (value: number) => void
}

export type Teleporter = {
  children: React.ReactNode
  targetEl: HTMLElement
  toPortal: boolean
}