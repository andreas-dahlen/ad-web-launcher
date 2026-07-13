import type { StyleFromVars, VarDef } from '../../shared/sxCompiler/svsx.types'
import css from './scroll.module.css'
export const scrollVars = {
  width: { name: "width", allowed: [] as const },
  height: { name: "height", allowed: [] as const },
  knobHeight: { name: "knob-height", allowed: [] as const },
  knobWidth: { name: "knob-width", allowed: [] as const }
} as Record<string, VarDef>

export const scrollAlwaysAllowed = ["o", "p"] as const

export type ScrollStyle = StyleFromVars<typeof scrollVars, typeof scrollAlwaysAllowed>

export const scrollPreset = {
  default: css.randomtestpreset
} as const

export type ScrollPreset = keyof typeof scrollPreset