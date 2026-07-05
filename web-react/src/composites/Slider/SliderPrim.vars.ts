import css from './Slider.module.css'
export const sliderVars = {
  width: { name: "slider-width", allowed: [] as const },
  height: { name: "slider-height", allowed: [] as const },
  bg: { name: "slider-col", allowed: [] as const },
  radius: { name: "slider-radius", allowed: [] as const },
  opacity: { name: "slider-opacity", allowed: [] as const },

  thumbWidth: { name: "thumb-width", allowed: [] as const },
  thumbHeight: { name: "thumb-height", allowed: [] as const },
  thumbBg: { name: "thumb-col", allowed: [] as const },
  thumbRadius: { name: "thumb-radius", allowed: [] as const },
  thumbBorder: { name: "thumb-border", allowed: [] as const }
} as const

export const sliderAlwaysAllowed = ["override", "preset"] as const
export type SliderVarKey = keyof typeof sliderVars
export type SliderStyleOverrides = Partial<Record<SliderVarKey, string | number>>

export const sliderPresetMap = {
  default: css.placeHolder
} as const

export type SliderPreset = keyof typeof sliderPresetMap