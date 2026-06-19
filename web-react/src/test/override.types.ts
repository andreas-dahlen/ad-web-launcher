import type { Computed } from '@interaction/types/computed.types'
import type { ButtonDesc, CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types'
import type { RuntimePress, RuntimePressRelease, RuntimeSwipe, RuntimeCommit, RuntimeStart } from '@interaction/types/runtimeStuff.types'

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
  runtime?: Partial<RuntimeStart>
  desc?: Partial<DescriptorSwipeMap[T]>
  computed?: null
}
export type InterpreterSwipeOverrides<T extends keyof DescriptorSwipeMap> = {
  runtime?: Partial<RuntimeSwipe>
  desc?: Partial<DescriptorSwipeMap[T]>
  computed?: Computed
}
export type InterpreterSwipeCommitOverrides<T extends keyof DescriptorSwipeMap> = {
  runtime?: Partial<RuntimeCommit>
  desc?: Partial<DescriptorSwipeMap[T]>
  computed?: Computed
}