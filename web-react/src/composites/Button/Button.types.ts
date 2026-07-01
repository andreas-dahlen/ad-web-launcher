import type { Icon } from '@phosphor-icons/react'
import type { SnapConfig } from '@primitives/prim.types'
import type { BoxSide, EventType } from '@typing/core.types'
import type { DataAttributes } from '@typing/propUtils.types'
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
  useSettingsSnap?: boolean
  snapX?: number
  snapY?: number
}
export type IconProps = IconSettings & {
  Icon: Icon | DynamicIconComponent
  mode: Mode
}
export type LabelProps = LabelSettings & {
  label: string
  mode: Mode
}
export type Mode = "default" | "on" | "off" | "disabled"

export type ModeProp = Mode | boolean

export type ButtonProps = SnapConfig & {
  className?: string
  dataAttrs?: DataAttributes

  isMovable?: boolean
  isInFlow?: boolean
  mode?: ModeProp

  iconSettings?: IconSettings
  labelSettings?: LabelSettings
  dragSettings?: DragSettings

  label?: string
  Icon?: Icon | DynamicIconComponent

  // action?: string
  onSwipeCommit?: (detail: EventType) => void
  onPressRelease?: (detail: EventType) => void
}