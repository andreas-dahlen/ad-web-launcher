// src/state/zustandHook.ts
import { useStore } from './zustandStore.ts'
import { carouselStateFn } from './carouselState.ts'
import { sliderStateFn } from './sliderState.ts'
import { dragStateFn } from './dragState.ts'

const stateFiles: Record<DataKeys, { ensure: (id: string) => unknown }> = {
  carousel: carouselStateFn,
  slider: sliderStateFn,
  drag: dragStateFn,
}

export const subscribe = {
  /**
   * Subscribe to full reactive object
   */
useFull<T extends keyof ReactiveDataMap>(type: DataKeys, id: string): ReactiveDataMap[T] {
    const stateFile = stateFiles[type]
    if (!stateFile) throw new Error(`No state file found for type "${type}"`)

    // Auto-ensure object exists
    stateFile.ensure(id)

    return useStore((state) => {
      const reactive = state.reactives[`${type}:${id}`]
      if (!reactive) throw new Error(`Reactive ${type}:${id} not found`)
      return reactive.data as ReactiveDataMap[T]
    })
  },

  /**
   * Subscribe to partial reactive object
   */
usePartial<T extends DataKeys, S>(type: T, id: string, selector: (data: ReactiveDataMap[T]) => S): S {
    const stateFile = stateFiles[type]
    if (!stateFile) throw new Error(`No state file found for type "${type}"`)

    // Auto-ensure object exists
    stateFile.ensure(id)

    return useStore((state) => {
      const reactive = state.reactives[`${type}:${id}`]
      if (!reactive) throw new Error(`Reactive ${type}:${id} not found`)
      return selector(reactive.data as ReactiveDataMap[T])
    })
  },
}