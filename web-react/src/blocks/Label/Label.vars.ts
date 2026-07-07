import type { StyleFromVars, VarDef } from '@utils/svsx.types'
import css from './Label.module.css'

export const labelVars = {
  letterSpacing: { name: "letter-spacing", allowed: [] as const },
  position: { name: "position", allowed: [] as const },
} as Record<string, VarDef>


export const labelAlwaysAllowed = ["o", "p"] as const
export type LabelStyle = StyleFromVars<typeof labelVars, typeof labelAlwaysAllowed>

export const labelPreset = {
  sexy: css.sexy
} as const

export type LabelPreset = keyof typeof labelPreset;