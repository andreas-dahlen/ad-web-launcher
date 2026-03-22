// src/state/interactionStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export function getReactiveType<T extends ReactiveType>(type: T, id: string): Reactive<ReactiveDataMap[T]> {
  return Store.getState().get(type, id)
}

export const Store = create<ReactiveStore>()(
  immer((set, get) => ({
    reactives: {},

    add: (reactive) =>
      set((state) => {
        const key = `${reactive.type}:${reactive.id}`
        state.reactives[key] = reactive
      }),

    remove: (type, id) =>
      set((state) => {
        const key = `${type}:${id}`
        delete state.reactives[key]
      }),

    get: (type, id) => {
        const key = `${type}:${id}`
        return get().reactives[key]
    }
  }))
)