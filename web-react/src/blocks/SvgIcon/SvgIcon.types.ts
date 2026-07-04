import type { Icon } from '@phosphor-icons/react'
import type { Mode } from '@composites/comp.types'
import type { DynamicIconComponent } from '@typing/svg'
import type { ButtonStyleOverrides } from './SvgIcon.vars'

export type IconSettings = {
  Svg: Icon | DynamicIconComponent
  mode?: Mode
  variant?: 'bold' | 'thin' | 'light' | 'regular' | 'fill' | 'duotone'
  phosphorSize?: number
  styleVars?: ButtonStyleOverrides
}