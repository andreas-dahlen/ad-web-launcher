import css from './SvgIcon.module.css'
export const svgIconVars = {
  svgWidth: { name: "svg-width", allowed: [] as const },
  svgHeight: { name: "svg-height", allowed: [] as const },
  svgDefaultCol: { name: "svg-default", allowed: [] as const },
  svgOnCol: { name: "svg-on", allowed: [] as const },
  svgOffCol: { name: "svg-off", allowed: [] as const },
  svgDisabledCol: { name: "svg-disabled", allowed: [] as const },
  svgRotate: { name: "rotate", allowed: [] as const },
  svgFlipX: { name: "flip-x", allowed: [] as const },
  svgFlipY: { name: "flip-y", allowed: [] as const },
  //TODO missing svg-* prefix
} as const

export const svgIconAlwaysAllowed = ["override", "preset"] as const
export type SvgIconVarKey = keyof typeof svgIconVars
export type SvgIconStyleOverrides = Partial<Record<SvgIconVarKey, string | number>>

export const svgIconPresetMap = {
  big: css.svg
} as const

export type svgIconPreset = keyof typeof svgIconPresetMap