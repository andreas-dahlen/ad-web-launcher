import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Vec2 } from '../typeScript/core/primitiveType.ts'
import type { CtxDrag } from '../typeScript/descriptor/ctxType.ts'
import type { DragLayout } from '@typeScript/descriptor/dataType.ts'

type Drag = {
  //react motion
  offset: Vec2
  dragging: boolean
  //reactPosition
  position: Vec2
  // non reactive

  layout: DragLayout
}

export type DragStore = {
  bindings: Record<string, Drag>
  init: (id: string) => void
  get: (id: string) => Readonly<Drag> | null
  delete: (id: string) => void

  setLayout: (id: string, layout: DragLayout) => void
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
          layout: {
            constraints: {
              minX: -Infinity,
              maxX: Infinity,
              minY: -Infinity,
              maxY: Infinity
            },
            container: { x: 0, y: 0 },
            item: { x: 0, y: 0 }
          }
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

    setLayout(id, packet) {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.layout = {
          constraints: packet.constraints,
          container: packet.container,
          item: packet.item
        }
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
