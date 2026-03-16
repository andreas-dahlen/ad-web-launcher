import { useSyncExternalStore } from "react"

export function createStore<T extends object>(initialState: T) {
  const state = initialState
  const listeners = new Set<() => void>()

  function setState(updater: (draft: T) => void) {
    updater(state)
    listeners.forEach((cb) => cb())
  }

  function subscribe(callback: () => void) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }

  function getSnapshot() {
    return state
  }

  function useStore<U = T>(selector?: (s: T) => U): U {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot)
    return selector ? selector(snapshot) : (snapshot as unknown as U)
  }

  return { setState, subscribe, getSnapshot, useStore }
}