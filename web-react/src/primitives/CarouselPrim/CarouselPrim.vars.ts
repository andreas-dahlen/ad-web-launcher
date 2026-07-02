export const carouselVars = {
  width: "--scene-width",
  height: "--scene-height",
} as const

export type CarouselVarKey = keyof typeof carouselVars
export type CarouselStyleOverrides = Partial<Record<CarouselVarKey, string | number>>