export interface ComputedPatch {
  //Updates stay as its own part of descriptor and is never merged into other parts. Currently only used for slider and for scroll.
  //slider
  readonly sliderStartOffset?: number
  readonly sliderValuePerPixel?: number
  //scroll
  readonly isOverflow?: boolean
  readonly startOverflowValue?: number
}