import type { StyleFromVars, VarDef } from '@utils/svsx.types'
import css from './Button.module.css'
export const buttonVars = {
  position: { name: "position", allowed: [] as const },
  width: { name: "width", allowed: [] as const },
  height: { name: "height", allowed: [] as const },
  bg: { name: "bg", allowed: [] as const },
  radius: { name: "radius", allowed: [] as const },
  border: { name: "border", allowed: [] as const },
} as Record<string, VarDef>

export const buttonAlwaysAllowed = ["o", "p"] as const
export type ButtonStyle = StyleFromVars<typeof buttonVars, typeof buttonAlwaysAllowed>

export const buttonPreset = {
  default: css.button,
  notInFlow: css.notInFlow,
  close: css.close
} as const

export type ButtonPreset = keyof typeof buttonPreset