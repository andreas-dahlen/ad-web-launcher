import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { dragStore, type DragStore } from '../../../../stores/dragStore'
import { debugRegisterBinding, debugUnregisterBinding } from '@debug/functions'

const DEFAULTS = {
  position: { x: 0, y: 0 },
  offset: { x: 0, y: 0 },
  dragging: false,
  minX: -Infinity,
  maxX: Infinity,
  minY: -Infinity,
  maxY: Infinity
} as const

export const useDragStore = (id: string) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useDragStore')
    dragStore.getState().init(id)
    return () => {
      debugUnregisterBinding(id, 'useDragStore')
      dragStore.getState().delete(id)
    }
  }, [id])

  return dragStore(
    useShallow((s: DragStore) => s.bindings[id] ?? DEFAULTS)
  )
}