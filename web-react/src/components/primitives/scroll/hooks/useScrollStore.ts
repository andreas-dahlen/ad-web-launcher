import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { debugRegisterBinding, debugUnregisterBinding } from '@debug/functions'
import { scrollStore, type ScrollStore } from '../../../../stores/scrollStore'

const DEFAULTS = {
  liveValue: 0,
  settledValue: 0,
  containerSize: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  dragging: false
} as const

export const useScrollStore = (id: string) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useScrollStore')
    scrollStore.getState().init(id)
    return () => {
      debugUnregisterBinding(id, 'useScrollStore')
      scrollStore.getState().delete(id)
    }
  }, [id])

  return scrollStore(
    useShallow((s: ScrollStore) => s.bindings[id] ?? DEFAULTS)
  ) //TODO remove useShallow?
}