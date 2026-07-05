export const svgIconVars = {
  svgWidth: "--svg-width",
  svgHeight: "--svg-height",
  svgDefaultCol: "--svg-default",
  svgOnCol: "--svg-on",
  svgOffCol: "--svg-off",
  svgDisabledCol: "--svg-disabled",
  svgRotate: "--rotate",
  svgFlipX: "--flip-x",
  svgFlipY: "--flip-y",
  //TODO missing svg-* prefix
} as const

export type SvgIconVarKey = keyof typeof svgIconVars
export type SvgIconStyleOverrides = Partial<Record<SvgIconVarKey, string | number>>