import type { BaseInteraction } from "./base.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers } from "./data.ts"
import type { CarouselRuntime, SliderRuntime, DragRuntime } from "./runtime.ts"
import type { Reactions } from "./base.ts"


export type Descriptor = 
| {
  base: BaseInteraction
  data: CarouselData & CarouselModifiers
  runtime: CarouselRuntime
  reactions: Reactions
}
| {
  base: BaseInteraction
  data: SliderData
  runtime: SliderRuntime
  reactions: Reactions
}
| {
  base: BaseInteraction
  data: DragData & DragModifiers
  runtime: DragRuntime
  reactions: Reactions
}
| {
  base: BaseInteraction
  reactions: Reactions
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