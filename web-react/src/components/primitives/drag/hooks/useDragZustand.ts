import { dragStore, type DragStore } from '@interaction/zunstand/dragState'

const DEFAULTS = {
  position: { x: 0, y: 0 },
  offset: { x: 0, y: 0 },
  dragging: false,
  minX: -Infinity,
  maxX: Infinity,
  minY: -Infinity,
  maxY: Infinity
} as const

export const useDragZustand = (id: string) => {

  dragStore.getState().init(id)
  return dragStore(
    (s: DragStore) => s.dragStore[id] ?? DEFAULTS
  )
}
