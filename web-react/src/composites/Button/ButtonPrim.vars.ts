import css from './Button.module.css'
export const buttonVars = {
  position: { name: "button-position", allowed: [] as const },
  width: { name: "button-width", allowed: [] as const },
  height: { name: "button-height", allowed: [] as const },
  bg: { name: "button-bg", allowed: [] as const },
  radius: { name: "button-radius", allowed: [] as const },
  border: { name: "button-border", allowed: [] as const },
} as const

export const buttonAlwaysAllowed = ["override", "preset"] as const
export type ButtonVarKey = keyof typeof buttonVars
export type ButtonStyleOverrides = Partial<Record<ButtonVarKey, string | number>>

export const buttonPresetMap = {
  default: css.button,
  notInFlow: css.notInFlow,
  close: css.close
} as const

export type ButtonPreset = keyof typeof buttonPresetMap