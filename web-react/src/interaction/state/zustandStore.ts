// src/state/zustandAdapter.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
/**
 * Internal Zustand / ZustandHook
 */

//future typ safety implementation?
// reactives: {
//   carousel: Record<string, Reactive<'carousel'>>,
//   slider: Record<string, Reactive<'slider'>>,
//   drag: Record<string, Reactive<'drag'>>
// }

export const useStore = create<ReactiveStore>()(
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

    get: <T extends ReactiveType>(type: T, id: string) => {
      const key = `${type}:${id}`
      const reactive = get().reactives[key]
      return reactive as Reactive<T> | undefined
    }
  }))
)

export const store = {

  get: <T extends ReactiveType>(type: T, id: string) => {
    const r = useStore.getState().get<T>(type, id);
    return  r ? (r.data as unknown as Readonly<ReactiveDataMap[T]>) : undefined;// always returns the typed data
  },

  add: <T extends ReactiveType>(type: T, id: string, data: ReactiveDataMap[T]) => {
    useStore.getState().add({ type, id, data });
  },

  remove: (type: ReactiveType, id: string) => {
    useStore.getState().remove(type, id);
  },

  // optional helper to ensure existence
  ensure: <T extends ReactiveType>(
    type: T,
    id: string,
    defaultData: ReactiveDataMap[T]): Readonly<ReactiveDataMap[T]> => {
    const existing = store.get(type, id) as ReactiveDataMap[T];
    if (existing) return existing as unknown as Readonly<ReactiveDataMap[T]>; // live, mutable object
    // Add new to the store
    store.add(type, id, defaultData);
    // Return the live object from the store, not the detached default
    const created = store.get(type, id) as ReactiveDataMap[T];
    if (!created) {
      throw new Error(`[store.ensure] Failed to create ${type}:${id}`);
    }
    return created as unknown as Readonly<ReactiveDataMap[T]>;
  },

  mutate: <T extends ReactiveType>(
    type: T,
    id: string,
    fn: (data: ReactiveDataMap[T]) => void
  ) => {
    useStore.setState((s) => {
      const key = `${type}:${id}`
      const entry = s.reactives[key]
      if (!entry) return
      fn(entry.data as ReactiveDataMap[T])
    })
  }
};