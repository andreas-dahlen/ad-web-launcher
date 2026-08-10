import type { Axis1D, EventType, BoxSide } from '../../shared/types/core.types.ts'
import type { DataAttributes } from '../../shared/types/utils.types.ts'
import type React from 'react'
import type { CarouselPreset } from '@generated/presets/carousel.preset.ts'
import type { SliderPreset } from '@generated/presets/slider.preset.ts'
import type { ScrollPreset } from '@generated/presets/scroll.preset.ts'
import type { ButtonPreset } from '@generated/presets/button.preset.ts'
import type { CarouselStyle } from '@shared/generated/tokenModules/carousel.token.ts'
import type { SliderStyle } from '@shared/generated/tokenModules/slider.token.ts'
import type { ScrollStyle } from '@shared/generated/tokenModules/scroll.token.ts'
import type { ButtonStyle } from '@shared/generated/tokenModules/button.token.ts'

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

