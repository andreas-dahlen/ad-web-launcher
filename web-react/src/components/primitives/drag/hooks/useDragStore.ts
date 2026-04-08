import { dragStore, type DragStore } from '@interaction/stores/dragStore'
import { useEffect } from 'react'

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
    (s: DragStore) => s.bindings[id] ?? DEFAULTS
  )
}