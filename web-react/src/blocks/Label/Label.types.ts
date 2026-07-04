import type { BoxSide } from '@typing/core.types'
import type { LabelStyleOverrides } from './Label.vars'
import type { Mode } from '@composites/comp.types'

export type LabelSettings = {
  msg: string
  mode?: Mode
  el?: string
  position?: BoxSide | "center"
  styleVars?: LabelStyleOverrides
  classPreset?: string
}