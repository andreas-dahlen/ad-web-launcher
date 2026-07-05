import css from './carousel.module.css'
export const carouselVars = {
  width: { name: "scene-width", allowed: [] as const },
  height: { name: "scene-height", allowed: [] as const },
} as const

export const carouselAlwaysAllowed = ["override", "preset"] as const

export type CarouselVarKey = keyof typeof carouselVars
export type CarouselStyleOverrides = Partial<Record<CarouselVarKey, string | number>>

export const carouselPresetMap = {
  default: css.carouselPreset
} as const

export type CarouselPreset = keyof typeof carouselPresetMap