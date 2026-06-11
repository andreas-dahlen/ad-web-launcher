import type { Computed } from '@interaction/types/computed.types'
import type { ButtonDesc, CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types'
import type { RuntimePress, RuntimePressRelease, RuntimeSwipe, RuntimeSwipeCommit, RuntimeSwipeStart } from '@interaction/types/runtime.types'

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
// type CreateInputOverride<TDesc, TComputed = Computed> = {
//   runtime?: Partial<Runtime>
//   desc?: Partial<TDesc>
//   computed?: Partial<TComputed>
// }

// export type CreateCarouselInputOverride =
//   CreateInputOverride<CarouselDesc>

// export type CreateSliderInputOverride =
//   CreateInputOverride<SliderDesc, SliderComputed>

// export type CreateScrollInputOverride =
//   CreateInputOverride<ScrollDesc, ScrollComputed>

// export type CreateDragInputOverride =
//   CreateInputOverride<DragDesc>

// export type CreateButtonInputOverride =
//   CreateInputOverride<ButtonDesc>

// export type CreateInterpreterOverride<TDesc> = DescriptorMap<TDesc>

// export type DescriptorOverride<T extends Descriptor> = Partial<T>

export type DescriptorMap = {
  carousel: CarouselDesc
  slider: SliderDesc
  scroll: ScrollDesc
  drag: DragDesc
  button: ButtonDesc
}


export type TypeMap = {
  [K in keyof DescriptorMap]: (o?: Partial<DescriptorMap[K]>) => DescriptorMap[K]
}
export type InterpreterPressOverrides<T extends keyof DescriptorMap> = {
  runtime?: Partial<RuntimePress>
  desc?: Partial<DescriptorMap[T]>
  computed?: null
}
export type InterpreterPressReleaseOverrides<T extends keyof DescriptorMap> = {
  runtime?: Partial<RuntimePressRelease>
  desc?: Partial<DescriptorMap[T]>
  computed?: null
}



export type DescriptorSwipeMap = Omit<DescriptorMap, "button">

export type SwipeTypeMap = {
  [K in keyof DescriptorSwipeMap]: (o?: Partial<DescriptorSwipeMap[K]>) => DescriptorSwipeMap[K]
}
export type InterpreterSwipeStartOverrides<T extends keyof DescriptorSwipeMap> = {
  runtime?: Partial<RuntimeSwipeStart>
  desc?: Partial<DescriptorSwipeMap[T]>
  computed?: null
}
export type InterpreterSwipeOverrides<T extends keyof DescriptorSwipeMap> = {
  runtime?: Partial<RuntimeSwipe>
  desc?: Partial<DescriptorSwipeMap[T]>
  computed?: Computed
}
export type InterpreterSwipeCommitOverrides<T extends keyof DescriptorSwipeMap> = {
  runtime?: Partial<RuntimeSwipeCommit>
  desc?: Partial<DescriptorSwipeMap[T]>
  computed?: Computed
}