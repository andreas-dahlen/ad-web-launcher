import type { SnapConfig } from '@primitives/types/prim.types.ts'
import type { Axis1D, EventType } from '../../shared/types/core.types.ts'
import type { ButtonPreset } from '@generated/presets/button.preset.ts'
import type { SliderPreset } from '@generated/presets/slider.preset.ts'
import type { ButtonStyle } from '@shared/generated/tokenModules/button.token.ts'
import type { SliderStyle } from '@shared/generated/tokenModules/slider.token.ts'

// `directive` contains high-level orchestration flags that determine
// how the composite exists in the UI. These are not drag or button
// mechanics — they are semantic directives that govern layout,
// interactivity, and behavioral capabilities.
export type Directive = {
  mode?: ModeInput
  interactive?: boolean
  movable?: boolean
  isInFlow?: boolean
}

type ModeInput = Mode | boolean
export type Mode = "default" | "disabled" | "on" | "off"

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