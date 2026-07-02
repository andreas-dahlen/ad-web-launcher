import type { Icon } from '@phosphor-icons/react'
import type { ButtonStyleOverrides } from '@primitives/ButtonPrim/ButtonPrim.vars'
import type { BoxSide, EventType } from '@typing/core.types'
import type { DynamicIconComponent } from '@typing/svg'

export type IconSettings = {
  variant?: 'bold' | 'thin' | 'light' | 'regular' | 'fill' | 'duotone'
  color?: {
    default: string
    on?: string
    off?: string
    disabled?: string
  }
  size?: string | number
  adjust?: {
    flipX?: boolean;
    flipY?: boolean;
    rotate?: 90 | 180 | 270;
  };
}
export type LabelSettings = {
  position?: BoxSide
}
type DragSettings = {
  snapX?: number
  snapY?: number
  useSettingsSnap?: boolean
  onSwipeCommit?: (detail: EventType) => void
}
type ButtonSettings = {
  movable?: boolean
  inFlow?: boolean
  className?: string
  styleVars?: ButtonStyleOverrides
  onPressRelease?: (detail: EventType) => void
}
export type ModeInput = Mode | boolean
//new guide
export type ButtonProps = {
  mode?: ModeInput
  icon?: {
    Svg: Icon | DynamicIconComponent
    settings?: IconSettings
  }
  label?: {
    msg: string
    settings?: LabelSettings
  }
  button?: ButtonSettings
  drag?: DragSettings
}

export type IconProps = IconSettings & {
  Svg: Icon | DynamicIconComponent
  mode: Mode
}
export type LabelProps = LabelSettings & {
  msg: string
  mode: Mode
}
export type Mode = "default" | "on" | "off" | "disabled"