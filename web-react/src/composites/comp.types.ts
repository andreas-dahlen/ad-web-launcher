import type { ButtonPreset, ButtonStyle } from '@composites/Button/ButtonPrim.vars'
import type { SliderPreset, SliderStyle } from '@composites/Slider/SliderPrim.vars'
import type { SnapConfig } from '@primitives/prim.types'
import type { Axis1D, EventType } from '@typing/core.types'

// `directive` contains high-level orchestration flags that determine
// how the composite exists in the UI. These are not drag or button
// mechanics — they are semantic directives that govern layout,
// interactivity, and behavioral capabilities.
export type Directive = {
  mode?: ModeInput
  movable?: boolean
  isInFlow?: boolean
}

export type ModeInput = Mode | boolean
export type Mode = "default" | "on" | "off" | "disabled"

export type DragSettings = SnapConfig & {
  onSwipeCommit?: (detail: EventType) => void
}
export type ButtonSettings = {
  styleVars?: ButtonStyle
  presets?: ButtonPreset[]
  onPressRelease?: (detail: EventType) => void
}

export type SliderSettings = {
  axis: Axis1D
  styleVars?: SliderStyle
  presets?: SliderPreset[]
  onValueChange?: (value: number) => void
}