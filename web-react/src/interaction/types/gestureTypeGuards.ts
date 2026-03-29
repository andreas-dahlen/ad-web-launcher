import type { ButtonDescriptor, CarouselDescriptor, Descriptor, DragDescriptor, SliderDescriptor } from '@interaction/types/descriptor'
// // gestureTypeGuards.ts
export function descIs<T extends Descriptor['type']>(
  value: Descriptor,
  type: T
): asserts value is Extract<Descriptor, { type: T }> {
  if (value.type !== type) {
    const msg = `Expected ${type}, got ${value.type}`
    if (import.meta.env.VITE_DEBUG === 'true') throw new Error(msg)
    console.warn(msg)
  }
}

export function isCarousel(value: Descriptor): asserts value is CarouselDescriptor {
  descIs(value, 'carousel')
}

export function isDrag(value: Descriptor): asserts value is DragDescriptor {
  descIs(value, 'drag')
}

export function isSlider(value: Descriptor): asserts value is SliderDescriptor {
  descIs(value, 'slider')
}

export function isButton(value: Descriptor): asserts value is ButtonDescriptor {
  descIs(value, 'button')
}
// export function isGestureType(type: InteractionType | null): type is DataKeys {
//   return type === "carousel" ||
//          type === "slider" ||
//          type === "drag"
// }


// export function isStateFn2Arg(fnName: string): fnName is StateFn2Arg {
//   return ['press', 'swipeStart', 'swipe', 'swipeCommit', 'swipeRevert'].includes(fnName)
// }¨

// export function isOfType<T extends Descriptor['type']>(
//   desc: Descriptor,
//   type: T
// ): desc is Extract<Descriptor, { type: T }> {
//   return desc.type === type
// }


// export function isOfType<T extends value['type']>(
//   value: boolean,
//   type: T
// ): desc is Extract<value, { type: T }> {
//   return desc.type === type
// }

// T = the union type
// K = the key to discriminate on
// V = the value you want to check

// export function ensure<
//   T,
//   K extends keyof T,
//   V extends T[K]

