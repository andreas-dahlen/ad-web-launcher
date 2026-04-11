import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { dragStore, type DragStore } from '@stores/dragStore.ts'

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
    dragStore.getState().init(id)
    return () => dragStore.getState().delete(id)
  }, [id])

  return dragStore(
    useShallow((s: DragStore) => s.bindings[id] ?? DEFAULTS)
  )
}