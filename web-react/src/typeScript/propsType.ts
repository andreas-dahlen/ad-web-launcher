import type { CtxType } from './descriptor/ctxType.ts'

export type DataAttributes = {
  [key: `data-${string}`]:
  string |
  number |
  boolean |
  undefined
}

export interface DragProps {
  id: string
  snapX?: number
  snapY?: number
  settingsSnap?: boolean
  lockable?: boolean
  onSwipeCommit?: (detail: CtxType) => void
  children?: React.ReactNode
  className?: string
  dragDataAttrs?: DataAttributes
}

export interface CarouselProps {
  id: string
  axis: 'horizontal' | 'vertical'
  scenes?: React.ComponentType[]
  sceneCount?: number
  lockPrevAt?: number
  lockNextAt?: number
  interactive?: boolean
  onSwipeCommit?: (detail: CtxType) => void
  carouselDataAttrs?: DataAttributes
}

export interface SliderProps {
  id: string
  axis: 'horizontal' | 'vertical'
  onValueChange?: (value: number) => void
  children?: React.ReactNode
  className?: string
  trackClassName?: string
  thumbClassName?: string
  sliderDataAttrs?: DataAttributes
}

export interface ButtonProps {
  id: string
  className?: string
  action?: string
  interactive?: boolean
  onPressRelease?: (detail: CtxType) => void
  children?: React.ReactNode
  buttonDataAttrs?: DataAttributes
}

export interface DragButtonProps {
  id: string
  snapX?: number
  snapY?: number
  settingsSnap?: boolean
  onSwipeCommit?: (detail: CtxType) => void
  children?: React.ReactNode
  className?: string
  action?: string
  isDrag?: boolean
  onPressRelease?: (detail: CtxType) => void
  dragDataAttrs?: DataAttributes
  buttonDataAttrs?: DataAttributes
}