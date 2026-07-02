import type { ButtonStyleOverrides } from '@primitives/ButtonPrim/ButtonPrim.vars'
import type { CarouselStyleOverrides } from '@primitives/CarouselPrim/CarouselPrim.vars'
import type { ScrollStyleOverrides } from '@primitives/ScrollPrim/ScrollPrim.vars'
import type { SliderStyleOverrides } from '@primitives/SliderPrim/SliderPrim.vars'
import type { Axis1D, EventType, BoxSide } from '@typing/core.types'
import type { BaseProps, DataAttributes } from '@typing/propUtils.types'
import type React from 'react'

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

export type OverflowProps =
  | { overflowSide: BoxSide; isInitialVisible: boolean }
  | { overflowSide: never; isInitialVisible: never }

//domain layer
export type DragPrimProps = BaseProps & SnapConfig & {
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: EventType) => void
}

export type InputCarouselPrimProps = BaseProps & {
  axis: Axis1D
  lockPrevAt?: number
  lockNextAt?: number
  onSwipeCommit?: (detail: EventType) => void
}
export type ContentCarouselPrimProps = BaseProps & {
  axis: Axis1D
  scenes: React.ReactNode[]
  carouselDataAttrs?: DataAttributes
  styleVars?: CarouselStyleOverrides
}

export type SliderPrimProps = BaseProps & {
  axis: Axis1D
  instantSwipe?: boolean
  trackClassName?: string
  thumbClassName?: string
  children?: React.ReactNode
  sliderDataAttrs?: DataAttributes
  styleVars?: SliderStyleOverrides
  onValueChange?: (value: number) => void
}

export type ScrollPrimProps = BaseProps & OverflowProps & {
  axis: Axis1D
  instantSwipe?: boolean
  children?: React.ReactNode
  scrollDataAttrs?: DataAttributes
  styleVars?: ScrollStyleOverrides
}

export type ButtonPrimProps = BaseProps & {
  action?: string
  children?: React.ReactNode
  buttonDataAttrs?: DataAttributes
  styleVars?: ButtonStyleOverrides
  onPressRelease?: (detail: EventType) => void
}