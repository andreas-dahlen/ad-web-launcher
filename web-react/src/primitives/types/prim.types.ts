import type { ButtonPreset } from '@composites/Button/ButtonPrim.vars'
import type { CarouselPreset } from '@composites/styleVars/CarouselPrim.vars'
import type { ScrollPreset } from '@composites/styleVars/ScrollPrim.vars'
import type { SliderPreset } from '@composites/Slider/SliderPrim.vars'
import type { ButtonStyle, CarouselStyle, ScrollStyle, SliderStyle } from '../../styleCompiler/schema/components'
import type { Axis1D, EventType, BoxSide } from '@typing/core.types'
import type { DataAttributes } from '@typing/utils.types'
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
  presets?: CarouselPreset[]
}

export type SliderPrimProps = BasePrimProps & {
  axis: Axis1D
  instantSwipe?: boolean
  children?: React.ReactNode
  sliderDataAttrs?: DataAttributes
  styleVars?: SliderStyle
  presets?: SliderPreset[]
  onValueChange?: (value: number) => void
}

export type ScrollPrimProps = BasePrimProps & OverflowProps & {
  axis: Axis1D
  instantSwipe?: boolean
  children?: React.ReactNode
  scrollDataAttrs?: DataAttributes
  styleVars?: ScrollStyle
  presets?: ScrollPreset[]
}

export type ButtonPrimProps = BasePrimProps & {
  action?: string
  children?: React.ReactNode
  buttonDataAttrs?: DataAttributes
  styleVars?: ButtonStyle
  presets?: ButtonPreset[]
  onPressRelease?: (detail: EventType) => void
}


export type BasePrimProps = {
  id: string
  interactive?: boolean
  isInFlow?: boolean
}