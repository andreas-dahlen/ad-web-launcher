import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { DragDescriptor } from "@interaction/types/descriptor.ts"
import type { Vec2 } from '@interaction/types/primitives'

type Drag = {
  //react motion
  offset: Vec2
  dragging: boolean
  //reactPosition
  position: Vec2
  // The "Optional" section non reactive
  minX: number
  maxX: number
  minY: number
  maxY: number

}

export type Store = {
  dragStore: Record<string, Drag>
  init: (id: string) => void
  get: (id: string) => Readonly<Drag>
  setConstraints: (id: string, constraints: { minX?: number, maxX?: number, minY?: number, maxY?: number }) => void
  setPosition: (id: string, pos: Vec2) => void
  swipeStart: (desc: DragDescriptor) => void
  swipe: (desc: DragDescriptor) => void
  swipeCommit: (desc: DragDescriptor) => void
}

export const dragStore = create<Store>()(
  immer((set, get) => ({

    dragStore: {},

    //tsx only!
    init: (id) => {
      if (get().dragStore[id]) return

      set(state => {
        state.dragStore[id] = {
          position: { x: 0, y: 0 },
          offset: { x: 0, y: 0 },
          dragging: false
          constraints:
          //minX, maxX, minY, maxY are all optional...
        }
      })
    },
    get: (id) => {
      return Object.freeze(get().dragStore[id])
    },

    setConstraints: (id, packet) => {

      set(state => {
        const s = state.dragStore[id]
        if (packet.minX !== undefined) s.minX = packet.minX;
        if (packet.maxX !== undefined) s.maxX = packet.maxX;
        if (packet.minX !== undefined) s.minX = packet.minX;
        if (packet.maxX !== undefined) s.maxX = packet.maxX;
      })
    },


    setPosition: (id, pos) => {
      set(state => {
        state.dragStore[id].position = { x: pos.x, y: pos.y }
      })
    },

    swipeStart: (desc) => {
      set(state => {
        const s = state.dragStore[desc.base.id]
        s.dragging = false
        s.offset = { x: 0, y: 0 }
      })
    },

    swipe: (desc) => {
      set(state => {
        state.dragStore[desc.base.id].offset = desc.runtime.delta ?? state.dragStore[desc.base.id].offset
      })
    },

    swipeCommit: (desc) => {
      set(state => {
        const s = state.dragStore[desc.base.id]
        s.position = desc.runtime.delta ?? s.position
        s.offset = { x: 0, y: 0 }
        s.dragging = false
      })
    }
  })
  )
)
