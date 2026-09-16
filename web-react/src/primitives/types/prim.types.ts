import type { Axis1D, EventType, BoxSide } from '@shared/types/core.types.ts'
import type { DataAttributes } from '@shared/types/utils.types.ts'
import type { ButtonPresets, ButtonStyle, CarouselPresets, CarouselStyle, ScrollPresets, ScrollStyle, SliderPresets, SliderStyle } from 'cascade/generated'
import type React from 'react'

//discriminating unions - capabilities
export type SnapConfig = //default is false
  {
    useSettingsSnap?: boolean
    snapX?: number
    snapY?: number
  }
type BasePrimProps = {
  id: string
  interactive?: boolean
  isInFlow?: boolean
}

type OverflowProps =
  | { overflowSide: BoxSide; isInitialVisible: boolean }
  | { overflowSide: never; isInitialVisible: never }

//domain layer
export type DragPrimProps = BasePrimProps & SnapConfig & {
  children?: React.ReactNode
  dragDataAttrs?: DataAttributes
  onSwipeCommit?: (detail: EventType) => void
}

export type InputCarouselPrimProps = BasePrimProps & {
  axis: Axis1D
  lockPrevAt?: number
  lockNextAt?: number
  onSwipeCommit?: (detail: EventType) => void
}
export type ContentCarouselPrimProps = BasePrimProps & {
  axis: Axis1D
  scenes: React.ReactNode[]
  carouselDataAttrs?: DataAttributes
  styleVars?: CarouselStyle
  presets?: CarouselPresets
}

export type SliderPrimProps = BasePrimProps & {
  axis: Axis1D
  instantSwipe?: boolean
  children?: React.ReactNode
  sliderDataAttrs?: DataAttributes
  styleVars?: SliderStyle
  presets?: SliderPresets
  onValueChange?: (value: number) => void
}

export type ScrollPrimProps = BasePrimProps & OverflowProps & {
  axis: Axis1D
  instantSwipe?: boolean
  children?: React.ReactNode
  scrollDataAttrs?: DataAttributes
  styleVars?: ScrollStyle
  presets?: ScrollPresets
}

export type ButtonPrimProps = BasePrimProps & {
  action?: string
  children?: React.ReactNode
  buttonDataAttrs?: DataAttributes
  styleVars?: ButtonStyle
  presets?: ButtonPresets
  onPressRelease?: (detail: EventType) => void
}

