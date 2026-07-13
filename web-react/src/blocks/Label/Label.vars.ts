import css from './Label.module.css'

export const labelPreset = {
  sexy: css.sexy
} as const

export type LabelPreset = keyof typeof labelPreset;