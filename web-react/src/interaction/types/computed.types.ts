export interface Computed {
  //slider
  readonly sliderStartOffset?: number
  readonly sliderValuePerPixel?: number
  //scroll
  readonly isOverflow?: boolean
  readonly startOverflowValue?: number
}

export type ComputedPatch = Computed & {
  pointerId: number
}