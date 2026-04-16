import type { CtxType } from './ctxType.ts'

export interface DragProps {
  id: string
  snapX?: number
  snapY?: number
  locked?: boolean
  reactSwipeCommit?: boolean
  onSwipeCommit?: (detail: CtxType) => void
  children?: React.ReactNode
  className?: string
}

export interface CarouselProps {
  id: string
  axis: 'horizontal' | 'vertical'
  scenes: React.ComponentType[]
  lockPrevAt?: number
  lockNextAt?: number
  reactSwipeCommit?: boolean
  interactive?: boolean
  onSwipeCommit?: (detail: CtxType) => void
  // className?: string
  //uses JSX scenes and not children
}

export interface SliderProps {
  id: string
  axis: 'horizontal' | 'vertical'
  reactSwipe?: boolean
  reactSwipeStart?: boolean
  reactSwipeCommit?: boolean
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