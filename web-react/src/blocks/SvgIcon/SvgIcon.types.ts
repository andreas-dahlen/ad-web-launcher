import type { Icon } from '@phosphor-icons/react'
import type { Mode } from '@typing/propUtils.types'
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

export type IconProps = IconSettings & {
  Svg: Icon | DynamicIconComponent
  mode: Mode
}