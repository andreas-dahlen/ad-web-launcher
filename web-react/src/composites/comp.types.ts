import type { ButtonStyleOverrides } from '@primitives/ButtonPrim/ButtonPrim.vars'
import type { SnapConfig } from '@primitives/prim.types'
import type { EventType } from '@typing/core.types'

// `directive` contains high-level orchestration flags that determine
// how the composite exists in the UI. These are not drag or button
// mechanics — they are semantic directives that govern layout,
// interactivity, and behavioral capabilities.
export type Directive = {
  mode?: ModeInput
  movable?: boolean
  inFlow?: boolean
}

export type ModeInput = Mode | boolean
export type Mode = "default" | "on" | "off" | "disabled"

export type DragSettings = SnapConfig & {
  onSwipeCommit?: (detail: EventType) => void
}
export type ButtonSettings = {
  className?: string
  styleVars?: ButtonStyleOverrides
  onPressRelease?: (detail: EventType) => void
}
