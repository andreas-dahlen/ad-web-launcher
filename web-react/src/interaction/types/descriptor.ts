import type { BaseInteraction, BaseWithSwipe, CancelData } from "./base.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers } from "./data.ts"
import type { CarouselSolutions, SliderSolutions, DragSolutions } from "./solutions.ts"
import type { Reactions } from "./base.ts"
import type { DataKeys, InteractionType } from '@interaction/types/primitives.ts'


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
  base: BaseWithSwipe<'carousel'>
  data: CarouselData & CarouselModifiers
  solutions: CarouselSolutions
  reactions: Reactions
  cancel?: CancelData
}

export type SliderDescriptor = {
  base: BaseWithSwipe<'slider'>
  data: SliderData
  solutions: SliderSolutions
  reactions: Reactions
  cancel?: CancelData
}

export type DragDescriptor = {
  base: BaseWithSwipe<'drag'>
  data: DragData & DragModifiers
  solutions: DragSolutions
  reactions: Reactions
  cancel?: CancelData
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

export function isButtonDesc(desc: Descriptor): desc is ButtonDescriptor {
  return desc.base.type === 'button'
}

export function isGestureType(type: InteractionType | null): type is DataKeys {
  return type === "carousel" ||
         type === "slider" ||
         type === "drag"
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