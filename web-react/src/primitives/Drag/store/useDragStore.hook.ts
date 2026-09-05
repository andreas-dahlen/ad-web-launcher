import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { dragStore, type DragBinding, type DragStore } from './drag.store.ts'
import { debugRegisterBinding, debugUnregisterBinding } from '@test/functions.debug.ts'

export const drag_DEFAULTS: DragBinding = {
  settledOffset: { x: 0, y: 0 },
  liveOffset: { x: 0, y: 0 },
  dragging: false,
  constraints: {
    minX: -Infinity,
    maxX: Infinity,
    minY: -Infinity,
    maxY: Infinity
  },
  layout: {
    containerSize: { width: 0, height: 0 },
    itemSize: { width: 0, height: 0 }
  },
  frameRect: {
    left: 0,
    top: 0
  }
} as const

export const useDragStore = (id: string) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useDragStore')
    dragStore.getState().init(id, drag_DEFAULTS)
    return () => {
      debugUnregisterBinding(id, 'useDragStore')
      dragStore.getState().delete(id)
    }
  }, [id])

  return dragStore(
    useShallow((s: DragStore) => s.bindings[id] ?? drag_DEFAULTS)
  ) //TODO remove useShallow?
}