import type { BoxSide } from '@typing/core.types'
import type { Mode } from '@composites/comp.types'
import type { Icon } from '@phosphor-icons/react'
import type { DynamicIconComponent } from '@typing/svg'
import type { LabelResolvedVars } from './styleVars/Label.vars'
import type { SvgIconResolvedVars } from './styleVars/SvgIcon.vars'

export type LabelSettings = {
  msg: string
  mode?: Mode
  el?: string
  position?: BoxSide | "center"
  resolvedVars?: LabelResolvedVars
  classPreset?: string
}


export type IconSettings = {
  Svg: Icon | DynamicIconComponent
  mode?: Mode
  variant?: 'bold' | 'thin' | 'light' | 'regular' | 'fill' | 'duotone'
  phosphorSize?: number
  styleVars?
}