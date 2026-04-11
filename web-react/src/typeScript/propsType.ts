import type { CtxType } from './ctxType.ts'

export interface DragProps {
  id: string
  className?: string
  snapX?: number
  snapY?: number
  locked?: boolean
  reactSwipeCommit?: boolean
  onSwipeCommit?: (detail: CtxType) => void
  children?: React.ReactNode
}

export interface CarouselProps {
  id: string
  axis: 'horizontal' | 'vertical'
  scenes: React.ComponentType[]
  className?: string
  lockPrevAt?: number
  lockNextAt?: number
  reactSwipeCommit?: boolean
  interactive?: boolean
  onSwipeCommit?: (detail: CtxType) => void
}

export interface SliderProps {
  id: string
  axis: 'horizontal' | 'vertical'
  className?: string
  reactSwipe?: boolean
  reactSwipeStart?: boolean
  reactSwipeCommit?: boolean
  onValueChange?: (value: number) => void
  trackStyling?: string
  children?: React.ReactNode
}