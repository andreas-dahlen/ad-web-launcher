
import type { StyleFromVars, VarDef } from '../../shared/compilerUtils/compiler.types'
import css from './carousel.module.css'
export const carouselVars = {
  width: { name: "width", allowed: [] as const },
  height: { name: "height", allowed: [] as const },
} as Record<string, VarDef>

export const carouselAlwaysAllowed = ["o", "p"] as const

export type CarouselStyle = StyleFromVars<typeof carouselVars, typeof carouselAlwaysAllowed>

export const carouselPreset = {
  default: css.carouselPreset
} as const

export type CarouselPreset = keyof typeof carouselPreset