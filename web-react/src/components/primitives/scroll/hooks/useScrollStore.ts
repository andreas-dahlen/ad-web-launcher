import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { debugRegisterBinding, debugUnregisterBinding } from '@debug/functions'
import { scrollStore, type ScrollStore } from '../../../../stores/scrollStore'

const DEFAULTS = {
  overflowValue: 0,
  liveValue: 0,
  isVisible: true,
  settledValue: 0,
  velocity: 0,
  containerSize: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  dragging: false
} as const

const DEFAULTS_OFFSCREEN = {
  overflowValue: 800,
  isVisible: false,
  liveValue: 0,
  settledValue: 0,
  velocity: 0,
  containerSize: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  dragging: false
} as const

export const useScrollStore = (id: string, isInitialVisible: boolean) => {

  const fallback = isInitialVisible ? DEFAULTS : DEFAULTS_OFFSCREEN

  useEffect(() => {
    debugRegisterBinding(id, 'useScrollStore')
    scrollStore.getState().init(id, fallback)
    return () => {
      debugUnregisterBinding(id, 'useScrollStore')
      scrollStore.getState().delete(id)
    }
  }, [fallback, id])

  return scrollStore(
    useShallow((s: ScrollStore) => s.bindings[id] ??
      fallback)
  ) //TODO remove useShallow?
}