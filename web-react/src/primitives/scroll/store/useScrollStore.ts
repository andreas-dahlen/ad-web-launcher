import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { debugRegisterBinding, debugUnregisterBinding } from '@test/functions'
import { scrollStore, type ScrollStore } from './scrollStore'

const DEFAULTS = {
  overflowValue: 0,
  liveValue: 0,
  isVisible: true,
  settledValue: 0,
  velocity: 0,
  dragging: false,
  layout: {
    containerSize: { width: 0, height: 0 },
    itemSize: { width: 0, height: 0 },
  }
} as const

const DEFAULTS_OFFSCREEN = {
  overflowValue: 800,
  isVisible: false,
  liveValue: 0,
  settledValue: 0,
  velocity: 0,
  dragging: false,
  layout: {
    containerSize: { width: 0, height: 0 },
    itemSize: { width: 0, height: 0 },
  }
} as const

export const useScrollStore = (id: string, isInitialVisible: boolean) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useScrollStore')
    scrollStore.getState().init(id, isInitialVisible ? DEFAULTS : DEFAULTS_OFFSCREEN)
    return () => {
      debugUnregisterBinding(id, 'useScrollStore')
      scrollStore.getState().delete(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return scrollStore(
    useShallow((s: ScrollStore) => s.bindings[id] ??
      (isInitialVisible ? DEFAULTS : DEFAULTS_OFFSCREEN))
  ) //TODO remove useShallow?
}