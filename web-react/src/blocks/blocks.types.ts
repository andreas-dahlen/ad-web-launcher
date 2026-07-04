import type { BoxSide } from '@typing/core.types'
import type { Mode } from '@composites/comp.types'
import type { Icon } from '@phosphor-icons/react'
import type { DynamicIconComponent } from '@typing/svg'
import type { SvgIconStyleOverrides } from './SvgIcon/SvgIcon.vars'
import type { LabelStyleOverrides } from './Label/Label.vars'

export type LabelSettings = {
  msg: string
  mode?: Mode
  el?: string
  position?: BoxSide | "center"
  styleVars?: LabelStyleOverrides
  classPreset?: string
}


export type IconSettings = {
  Svg: Icon | DynamicIconComponent
  mode?: Mode
  variant?: 'bold' | 'thin' | 'light' | 'regular' | 'fill' | 'duotone'
  phosphorSize?: number
  styleVars?: SvgIconStyleOverrides
}