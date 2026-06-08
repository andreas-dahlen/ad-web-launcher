import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { dragStore, type DragStore } from '@primitives/drag/store/drag.store'
import { debugRegisterBinding, debugUnregisterBinding } from '@test/functions.debug'

const DEFAULTS = {
  settledOffset: { x: 0, y: 0 },
  liveOffset: { x: 0, y: 0 },
  frame: {
    left: 0,
    top: 0,
    width: 0,
    height: 0
  },
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
    top: 0,
    width: 0,
    height: 0
  }
} as const

export const useDragStore = (id: string) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useDragStore')
    dragStore.getState().init(id, DEFAULTS)
    return () => {
      debugUnregisterBinding(id, 'useDragStore')
      dragStore.getState().delete(id)
    }
  }, [id])

  return dragStore(
    useShallow((s: DragStore) => s.bindings[id] ?? DEFAULTS)
  ) //TODO remove useShallow?
}