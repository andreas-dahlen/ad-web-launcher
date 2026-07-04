export const sliderVars = {
  panelWidth: "--slider-width",
  panelHeight: "--slider-height",
  panelBg: "--panel-col",
  panelRadius: "--panel-radius",

  trackRadius: "--track-radius",
  trackOpacity: "--track-opacity",
  trackBg: "--track-col",
  trackWidth: "--track-width",
  trackHeight: "--track-height",

  thumbWidth: "--thumb-width",
  thumbHeight: "--thumb-height",
  thumbBg: "--thumb-col",
  thumbRadius: "--thumb-radius",
  thumbBorder: "--thumb-border"
} as const

export type SliderVarKey = keyof typeof sliderVars
export type SliderStyleOverrides = Partial<Record<SliderVarKey, string | number>>