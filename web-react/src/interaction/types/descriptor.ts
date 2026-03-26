import type { BaseInteraction } from "./base.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers } from "./data.ts"
import type { CarouselRuntime, SliderRuntime, DragRuntime } from "./runtime.ts"
import type { Reactions } from "./base.ts"


// export type Descriptor = 
// | {
//   base: BaseInteraction& { type: 'carousel' }
//   data: CarouselData & CarouselModifiers
//   runtime: CarouselRuntime
//   reactions: Reactions
// }
// | {
//   base: BaseInteraction& { type: 'slider' }
//   data: SliderData
//   runtime: SliderRuntime
//   reactions: Reactions
// }
// | {
//   base: BaseInteraction& { type: 'drag' }
//   data: DragData & DragModifiers
//   runtime: DragRuntime
//   reactions: Reactions
// }
// | {
//   base: BaseInteraction& { type: 'button' }
//   reactions: Reactions
// }

export type CarouselDescriptor = {
  base: BaseInteraction & { type: 'carousel' }
  data: CarouselData & CarouselModifiers
  runtime: CarouselRuntime
  reactions: Reactions
}

export type SliderDescriptor = {
  base: BaseInteraction & { type: 'slider' }
  data: SliderData
  runtime: SliderRuntime
  reactions: Reactions
}

export type DragDescriptor = {
  base: BaseInteraction & { type: 'drag' }
  data: DragData & DragModifiers
  runtime: DragRuntime
  reactions: Reactions
}

export type ButtonDescriptor = {
  base: BaseInteraction & { type: 'button' }
  reactions: Reactions
}

export type Descriptor =
  | CarouselDescriptor
  | SliderDescriptor
  | DragDescriptor
  | ButtonDescriptor

  export function isCarouselDesc(desc: Descriptor): desc is CarouselDescriptor {
  return desc.base.type === 'carousel'
}

export function isSliderDesc(desc: Descriptor): desc is SliderDescriptor {
  return desc.base.type === 'slider'
}

export function isDragDesc(desc: Descriptor): desc is DragDescriptor {
  return desc.base.type === 'drag'
}
// export type InteractionDataMap = {
// carousel: CarouselData & CarouselModifiers
// drag: DragData & DragModifiers
// slider: SliderData
// button: null
// }
// export type InteractionType = keyof InteractionDataMap


// export type InteractionOf<K extends InteractionType> = {
//   base: BaseInteraction & { type: K }
//   data: InteractionDataMap[K] & Modifiers
//   runtime: RuntimeMap[K]
//   reactions: Reactions
// }

// type DescriptorMap = {
  //     [K in InteractionType]: InteractionDescriptor<K>
  //   }
  
  //  type Descriptor = DescriptorMap[InteractionType]
  
  // type DescriptorType<T extends Descriptor> = T["base"]["type"]
  
  // type DragDescriptor = InteractionDescriptor<'drag'>
  // type CarouselDescriptor = InteractionDescriptor<'carousel'>
  // type SliderDescriptor = InteractionDescriptor<'slider'>
  // type ButtonDescriptor = InteractionDescriptor<'button'>
  // type SwipeDescriptor = DescriptorMap[DataKeys]
  
  
  // /* =========================================================
  //    SolverUtils
  //    - Normalized1D
  //    ========================================================= */