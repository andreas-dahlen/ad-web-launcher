import type { CtxType } from './descriptor/ctxType.ts'


// utility
export type DataAttributes = {
  [key: `data-${string}`]:
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


//domain layer
export type DragProps = BaseProps & SnapConfig & {
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: CtxType) => void
}

export type CarouselProps = BaseProps & CarouselScenes & {
  axis: 'horizontal' | 'vertical'
  lockPrevAt?: number
  lockNextAt?: number
  carouselDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: CtxType) => void
}

export type SliderProps = BaseProps & {
  axis: 'horizontal' | 'vertical'
  trackClassName?: string
  thumbClassName?: string
  children?: React.ReactNode
  sliderDataAttrs?: DataAttributes
  onValueChange?: (value: number) => void
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
  className?: string
  action?: string
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  buttonDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: CtxType) => void
  onPressRelease?: (detail: CtxType) => void
}

export type DragSliderProps = SnapConfig & {
  id: string
  axis: 'horizontal' | 'vertical'
  className?: string
  trackClassName?: string
  thumbClassName?: string
  children?: React.ReactNode
  sliderDataAttrs?: DataAttributes
  dragDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: CtxType) => void
  onValueChange?: (value: number) => void
}