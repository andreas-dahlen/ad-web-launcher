import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Vec2 } from '../typeScript/core/primitiveType.ts'
import type { CtxDrag } from '../typeScript/descriptor/ctxType.ts'
import type { DragLayout } from '@typeScript/descriptor/dataType.ts'
import type { FrameSnapshot } from '@typeScript/descriptor/baseType.ts'

type Drag = {
  //react motion
  liveOffset: Vec2
  dragging: boolean
  //reactPosition
  settledOffset: Vec2

  // resize observer
  layout: DragLayout

  frame: FrameSnapshot
}

export type DragStore = {
  bindings: Record<string, Drag>
  init: (id: string) => void
  get: (id: string) => Readonly<Drag> | null
  delete: (id: string) => void

  setLayout: (id: string, layout: DragLayout) => void
  setFrame: (id: string, frame: FrameSnapshot) => void
  setPosition: (id: string, pos: Vec2) => void

  apply: (ctx: CtxDrag) => void
}

export const dragStore = create<DragStore>()(
  immer((set, get) => ({

    bindings: {},
    //tsx only!
    init: (id) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = {
          settledOffset: { x: 0, y: 0 },
          liveOffset: { x: 0, y: 0 },
          dragging: false,
          layout: {
            constraints: {
              minX: -Infinity,
              maxX: Infinity,
              minY: -Infinity,
              maxY: Infinity
            },
            containerSize: { width: 0, height: 0 },
            itemSize: { width: 0, height: 0 },
            deviceSize: { width: 0, height: 0 }
          },
          frame: {
            left: 0,
            top: 0,
            width: 0,
            height: 0
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
          containerSize: packet.containerSize,
          itemSize: packet.itemSize,
          deviceSize: packet.deviceSize
        }
      })
    },

    setFrame(id, packet) {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.frame = packet
      })
    },

    setPosition: (id, pos) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.settledOffset = { x: pos.x, y: pos.y }
      })
    },

    apply: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        switch (ctx.event) {
          case 'swipeStart': {
            s.dragging = true
            s.liveOffset = { x: 0, y: 0 }
            break
          }
          case 'swipe': {
            s.liveOffset = ctx.delta ?? s.liveOffset
            break
          }
          case 'swipeCommit': {
            s.settledOffset = ctx.delta ?? s.settledOffset
            s.liveOffset = { x: 0, y: 0 }
            s.dragging = false
            break
          }
          default: { throw new Error(`Invalid carousel event! Event: ${ctx.event}`) }
        }
      })
    }

  })
  )
)
