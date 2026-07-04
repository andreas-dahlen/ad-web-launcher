export const labelVars = {
  position: "--label-position",
  letterSpacing: "--label-letter-spacing"
  //TODO needs to be filled..
} as const

export type LabelVarKey = keyof typeof labelVars
export type LabelStyleOverrides = Partial<Record<LabelVarKey, string | number>>