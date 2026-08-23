export type ComputedPackage = ComputedPatch & {
  pointerId: number
}

type ComputedPatch = Computed
export type Computed = SliderComputed | ScrollComputed | null

export type SliderComputed = {
  readonly sliderStartOffset: number
  readonly sliderValuePerPixel: number
}

export type ScrollComputed = {
  readonly isOverflow: boolean
  readonly startOverflowValue: number
}


// export interface Computed {
//   //slider
//   readonly sliderStartOffset?: number
//   readonly sliderValuePerPixel?: number
//   //scroll
//   readonly isOverflow?: boolean
//   readonly startOverflowValue?: number
// }