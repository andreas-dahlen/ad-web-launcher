import type { Computed } from '@interaction/types/computed.types'
import type { ButtonDesc, CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types'
import type { Runtime } from '@interaction/types/Runtime.types'

// export type CreateButtonInputOverride = {
//   runtime?: Partial<Runtime>
//   desc?: Partial<ButtonDesc>
//   computed?: Partial<Computed>
// }
// export type CreateCarouselInputOverride = {
//   runtime?: Partial<Runtime>
//   desc?: Partial<CarouselDesc>
//   computed?: Partial<Computed>
// }
// export type CreateSliderInputOverride = {
//   runtime?: Partial<Runtime>
//   desc?: Partial<SliderDesc>
//   computed?: Partial<Computed>
// }
// export type CreateScrollInputOverride = {
//   runtime?: Partial<Runtime>
//   desc?: Partial<ScrollDesc>
//   computed?: Partial<Computed>
// }
// export type CreateDragInputOverride = {
//   runtime?: Partial<Runtime>
//   desc?: Partial<DragDesc>
//   computed?: Partial<Computed>
// }
type CreateInputOverride<TDesc> = {
  runtime?: Partial<Runtime>
  desc?: Partial<TDesc>
  computed?: Partial<Computed>
}
export type CreateCarouselInputOverride =
  CreateInputOverride<CarouselDesc>

export type CreateSliderInputOverride =
  CreateInputOverride<SliderDesc>

export type CreateScrollInputOverride =
  CreateInputOverride<ScrollDesc>

export type CreateDragInputOverride =
  CreateInputOverride<DragDesc>

export type CreateButtonInputOverride =
  CreateInputOverride<ButtonDesc>