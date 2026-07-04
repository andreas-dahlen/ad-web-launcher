import type { BoxSide } from '@typing/core.types'

export const labelVars = {
  position: "--label-position",
  //TODO needs to be filled..
}

export type LabelVarKey = keyof typeof labelVars
export type LabelStyleOverrides = Partial<Record<LabelVarKey, string | number>>