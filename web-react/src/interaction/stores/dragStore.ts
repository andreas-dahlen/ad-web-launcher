import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Vec2 } from '@interaction/types/primitiveType'
import type { CtxDrag } from '@interaction/types/ctxType'

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

export type DragStore = {
  bindings: Record<string, Drag>
  init: (id: string) => void
  get: (id: string) => Readonly<Drag> | null
  delete: (id: string) => void

  setConstraints: (id: string, constraints: { minX?: number, maxX?: number, minY?: number, maxY?: number }) => void
  setPosition: (id: string, pos: Vec2) => void
  swipeStart: (ctx: CtxDrag) => void
  swipe: (ctx: CtxDrag) => void
  swipeCommit: (ctx: CtxDrag) => void
}

export const dragStore = create<DragStore>()(
  immer((set, get) => ({

    bindings: {},
    //tsx only!
    init: (id) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = {
          position: { x: 0, y: 0 },
          offset: { x: 0, y: 0 },
          dragging: false,
          minX: -Infinity,
          maxX: Infinity,
          minY: -Infinity,
          maxY: Infinity
        }
      })
    },

    get: (id) => {
      return get().bindings[id] ?? null
    },

    delete: (id: string) => {
      set(state => {
        delete state.bindings[id]
      })
    },

    setConstraints: (id, packet) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        if (packet.minX !== undefined) s.minX = packet.minX;
        if (packet.maxX !== undefined) s.maxX = packet.maxX;
        if (packet.minY !== undefined) s.minY = packet.minY;
        if (packet.maxY !== undefined) s.maxY = packet.maxY;
      })
    },

    setPosition: (id, pos) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.position = { x: pos.x, y: pos.y }
      })
    },

    swipeStart: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.dragging = true
        s.offset = { x: 0, y: 0 }
      })
    },

    swipe: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.offset = ctx.delta ?? s.offset
      })
    },

    swipeCommit: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.position = ctx.delta ?? s.position
        s.offset = { x: 0, y: 0 }
        s.dragging = false
      })
    }
  })
  )
)
