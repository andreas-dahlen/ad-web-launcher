export const sliderVars = {
  width: "--slider-width",
  height: "--slider-height",
  bg: "--slider-col",
  radius: "--slider-radius",
  opacity: "--slider-opacity",

  thumbWidth: "--thumb-width",
  thumbHeight: "--thumb-height",
  thumbBg: "--thumb-col",
  thumbRadius: "--thumb-radius",
  thumbBorder: "--thumb-border"
} as const

export type SliderVarKey = keyof typeof sliderVars
export type SliderStyleOverrides = Partial<Record<SliderVarKey, string | number>>