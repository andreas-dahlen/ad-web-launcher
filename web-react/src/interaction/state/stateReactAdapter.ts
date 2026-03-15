// adapter.ts
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

  function useStore<U = T>(selector: (s: T) => U = (s) => s as unknown as U): U {
    return useSyncExternalStore(subscribe, () => selector(state))
  }

  return { setState, subscribe, getSnapshot, useStore }
}