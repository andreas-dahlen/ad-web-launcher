import type { CtxType } from './ctxType.ts'

export interface DragProps {
  id: string
  snapX?: number
  snapY?: number
  lockable?: boolean
  onSwipeCommit?: (detail: CtxType) => void
  children?: React.ReactNode
  className?: string
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
}

export interface SliderProps {
  id: string
  axis: 'horizontal' | 'vertical'
  onValueChange?: (value: number) => void
  children?: React.ReactNode
  className?: string
  trackStyling?: string
  thumbStyling?: string
}

export interface ButtonProps {
  id: string
  className?: string
  action?: string
  interactive?: boolean
  onPressRelease?: (detail: CtxType) => void
  children?: React.ReactNode
}