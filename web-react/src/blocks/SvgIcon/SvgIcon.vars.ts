import type { StyleFromVars, VarDef } from '@utils/svsx.types'
import css from './SvgIcon.module.css'
export const svgIconVars = {
  svgWidth: { name: "width", allowed: [] as const },
  svgHeight: { name: "height", allowed: [] as const },
  svgDefaultCol: { name: "default-bg", allowed: [] as const },
  svgOnCol: { name: "on", allowed: [] as const },
  svgOffCol: { name: "off", allowed: [] as const },
  svgDisabledCol: { name: "disabled-bg", allowed: [] as const },
  svgRotate: { name: "rotate", allowed: [] as const },
  svgFlipX: { name: "flip-x", allowed: [] as const },
  svgFlipY: { name: "flip-y", allowed: [] as const },
  //TODO missing svg-* prefix
} as Record<string, VarDef>

export const svgIconAlwaysAllowed = ["o", "p"] as const
export type SvgIconStyle = StyleFromVars<typeof svgIconVars, typeof svgIconAlwaysAllowed>

export const svgIconPreset = {
  big: css.svg
} as const

export type SvgIconPreset = keyof typeof svgIconPreset