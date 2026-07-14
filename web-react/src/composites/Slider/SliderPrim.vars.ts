
import type { StyleFromVars, VarDef } from '../../shared/compilerUtils/compiler.types'
import css from './Slider.module.css'
export const sliderVars = {
  width: { name: "width", allowed: [] as const },
  height: { name: "height", allowed: [] as const },
  bg: { name: "bg", allowed: [] as const },
  radius: { name: "radius", allowed: [] as const },
  opacity: { name: "opacity", allowed: [] as const },

  thumbWidth: { name: "thumb-width", allowed: [] as const },
  thumbHeight: { name: "thumb-height", allowed: [] as const },
  thumbBg: { name: "thumb-col", allowed: [] as const },
  thumbRadius: { name: "thumb-radius", allowed: [] as const },
  thumbBorder: { name: "thumb-border", allowed: [] as const }
} as Record<string, VarDef>

export const sliderAlwaysAllowed = ["o", "p"] as const
export type SliderStyle = StyleFromVars<typeof sliderVars, typeof sliderAlwaysAllowed>

export const sliderPreset = {
  default: css.placeHolder
} as const

export type SliderPreset = keyof typeof sliderPreset