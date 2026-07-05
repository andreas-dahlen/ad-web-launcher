import css from './Label.module.css'

export const labelVars = {
  letterSpacing: { name: "label-letter-spacing", allowed: [] as const },
  position: { name: "label-position", allowed: [] as const },
} as const


export const labelAlwaysAllowed = ["override", "preset"] as const
export type LabelVarKey = keyof typeof labelVars
export type LabelStyleOverrides = Partial<Record<LabelVarKey, string | number>>

export const labelPresetMap = {
  sexy: css.sexy
} as const

export type LabelPreset = keyof typeof labelPresetMap;