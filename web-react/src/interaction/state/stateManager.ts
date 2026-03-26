import type { CarouselDescriptor, DragDescriptor, SliderDescriptor } from '@interaction/types/descriptor.ts'
import { carouselStore } from '@interaction/zunstand/zustandStateMerge.ts'
import { dragStore } from '@interaction/zunstand/zustandDrag.ts'
import { sliderStore } from '@interaction/zunstand/zustandSlider.ts'


// type CallStoreAction = {
//     press: (desc: Descriptor) => void
//     swipeStart: (desc: Descriptor) => void
//     swipe: (desc: Descriptor) => void
//     swipeCommit: (desc: Descriptor) => void
//     swipeRevert: (desc: Descriptor) => void
// }
type AllowedEvents<T extends keyof EventMap> = EventMap[T][number]

type EventMap = {
  carousel: ['swipeStart', 'swipe', 'swipeCommit', 'swipeRevert']
  slider: ['swipeStart', 'swipe', 'swipeCommit', 'swipeRevert']
  drag: ['swipeStart', 'swipe', 'swipeCommit', 'swipeRevert']
}

type DescriptorOfStore<T extends keyof StoreMap> =
  T extends 'carousel' ? CarouselDescriptor :
  T extends 'slider'   ? SliderDescriptor :
  T extends 'drag'     ? DragDescriptor :
  never

type StoreMap = {
  [K in keyof EventMap]: {
    [E in AllowedEvents<K>]?: (desc: DescriptorOfStore<K>) => void
  }
}

const stores: StoreMap = {
  carousel: carouselStore.getState(),
  slider: sliderStore.getState(),
  drag: dragStore.getState(),
}

export function callStoreAction<
  T extends keyof StoreMap,
  E extends AllowedEvents<T>
>(type: T, event: E, desc: DescriptorOfStore<T>) {
  const store = stores[type]
  const handler = store[event] as ((desc: DescriptorOfStore<T>) => void) | undefined
    handler?.(desc)
}

// assuming these are Zustand stores with immer
// const stores = {
//   carousel: carouselStore,
//   slider: sliderStore,
//   drag: dragStore
// } as const

// type DataKeys = keyof typeof stores

// function callStoreAction<T extends DataKeys, K extends keyof Store>(
//   type: T,
//   action: K,
//   desc: Descriptor
// ) {
//   stores[type].setState((s: WritableDraft<Store>) => {
//     s[action](desc)
//   })
// }

// // usage
// callStoreAction('carousel', 'swipeStart', desc)



// const stores: Record<DataKeys, typeof carouselStore> = {
//   carousel: carouselStore,
//   slider: sliderStore,
//   drag: dragStore,
// } as const

// export const state = {
//   press(type: DataKeys, desc: Descriptor) {
//     stores[type].setState(s => s.press(desc))
//   },
//   swipeStart(type: DataKeys, desc: Descriptor) {
//     stores[type].setState((s: { swipeStart: (arg0: string) => void }) => s.swipeStart(desc))
//   },
//   swipe(type: DataKeys, desc: Descriptor) {
//     stores[type].setState(s => s.swipe(desc.base.id, desc))
//   },
//   swipeCommit(type: DataKeys, desc: Descriptor) {
//     stores[type].setState(s => s.swipeCommit(desc.base.id, desc))
//   },
//   swipeRevert(type: DataKeys, desc: Descriptor) {
//     stores[type].setState(s => s.swipeRevert(desc.base.id, desc))
//   }
// }
// type StateFn2 = (type: DataKeys, descOrId: Descriptor | string) => unknown
// type StateFn3 = (type: DataKeys, id: string, value: unknown) => unknown
// type StateFn2Arg =
//   | 'getSize'
//   | 'getThumbSize'
//   | 'getPosition'
//   | 'getConstraints'
//   | 'getCurrentIndex'
//   | 'get'
//   | 'ensure'
//   | 'press'
//   | 'swipeStart'
//   | 'swipe'
//   | 'swipeCommit'
//   | 'swipeRevert'

// type StateFn3Arg =
//   | 'setCount'
//   | 'setSize'
//   | 'setThumbSize'
//   | 'setPosition'
//   | 'setConstraints'

// type StateFnAny = (...args: unknown[]) => unknown

// const stateFiles: Record<DataKeys, Record<string, StateFnAny>> = {
//     carousel: carouselStore as Record<string, StateFnAny>,
//     slider: sliderStateFn as Record<string, StateFnAny>,
//     drag: dragStateFn as Record<string, StateFnAny>,
// }
// function callMutate(type: DataKeys, fnName: string, desc: Descriptor) {
//     return stateFiles[type]?.[fnName]?.(desc)
// }
// export const state = {
//     press(type: DataKeys, desc: Descriptor) { return callMutate(type, 'press', desc) },
//     swipeStart(type: DataKeys, desc: Descriptor) { return callMutate(type, 'swipeStart', desc) },
//     swipe(type: DataKeys, desc: Descriptor) { return callMutate(type, 'swipe', desc) },
//     swipeCommit(type: DataKeys, desc: Descriptor) { return callMutate(type, 'swipeCommit', desc) },
//     swipeRevert(type: DataKeys, desc: Descriptor) { return callMutate(type, 'swipeRevert', desc) }
// }

// function callGet(type: DataKeys, fnName: string, id: string) {
//     return stateFiles[type]?.[fnName]?.(id)
// }

// function callSet(type: DataKeys, fnName: string, id: string, value: unknown) {
//     return stateFiles[type]?.[fnName]?.(id, value)
// }
// /**
// //  * Calculate the target offset for a commit animation
// //  * @param {number} position - number //slider
// //  * | {x: number, y: number} //drag
// //  * |null //carousel
// //  * @param {number} constraints - {min: number, max: number} //slider
// //  * | {minX, maxX, minY, maxY} //drag
// //  * | null //carousel
// //  */
//     // // ----- METADATA READS ----- (for buildPayload.ts)
//     getSize(type: DataKeys, id: string) { return callGet(type, 'getSize', id) },
//     getThumbSize(type: DataKeys, id: string) { return callGet(type, 'getThumbSize', id) },
//     getPosition(type: DataKeys, id: string) { return callGet(type, 'getPosition', id) },
//     getConstraints(type: DataKeys, id: string) { return callGet(type, 'getConstraints', id) },
//     getCurrentIndex(type: DataKeys, id: string) { return callGet(type, 'getCurrentIndex', id) },

//     // ----- PURE READ ----- (for vue components and for importing reacting with the registered element)
//     get(type: DataKeys, id: string) { return callGet(type, 'get', id) },

//     // ----- EFFECTFUL WRITES ----- (by vue components)
//     ensure(type: DataKeys, id: string) { return callGet(type, 'ensure', id) },

//     setCount(type: DataKeys, id: string, length: number) { return callSet(type, 'setCount', id, length) },
//     setSize(type: DataKeys, id: string, value: Vec2) { return callSet(type, 'setSize', id, value) },
//     setThumbSize(type: DataKeys, id: string, value: Vec2) { return callSet(type, 'setThumbSize', id, value) },
//     setPosition(type: DataKeys, id: string, position?: Vec2 | number | null) { return callSet(type, 'setPosition', id, position) },
//     setConstraints(type: DataKeys, id: string, constraints: Vec2 | DragData['constraints']) { return callSet(type, 'setConstraints', id, constraints) },
//     setCurrentScenes(type: DataKeys, id: string, scenes: number[]) { return callSet(type, 'setCurrentScenes', id, scenes) },
//     // ----- SOLVER MUTATIONS -----

//could seperate into its own thing... since TS is complaining about arguments being 2...
