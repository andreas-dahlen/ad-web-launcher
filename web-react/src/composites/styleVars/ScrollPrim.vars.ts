import css from './scroll.module.css'
export const scrollVars = {
  width: { name: "scroll-width", allowed: [] as const },
  height: { name: "scroll-height", allowed: [] as const },
  knobHeight: { name: "knob-height", allowed: [] as const },
  knobWidth: { name: "knob-width", allowed: [] as const }
} as const

export const scrollAlwaysAllowed = ["override", "preset"] as const

export type ScrollVarKey = keyof typeof scrollVars
export type ScrollStyleOverrides = Partial<Record<ScrollVarKey, string | number>>

export const scrollPresetMap = {
  default: css.randomtestpreset
} as const

export type ScrollPreset = keyof typeof scrollPresetMap