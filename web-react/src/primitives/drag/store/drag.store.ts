import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Constraints2D, Vec2 } from '@typing/core.types'
import type { FrameSnapshot } from '@interaction/types/base.types'
import type { StoreLayout } from '@typing/store.types'
import type { DragAction } from '@interaction/types/action.types'

export type DragBinding = {
  //react motion
  liveOffset: Vec2
  dragging: boolean
  //reactPosition
  settledOffset: Vec2

  // resize observer

  layout: StoreLayout

  constraints: Constraints2D

  frameRect: FrameSnapshot
}

export type DragStore = {
  bindings: Record<string, DragBinding>
  init: (id: string, fallback: DragBinding) => void
  get: (id: string) => Readonly<DragBinding>
  delete: (id: string) => void

  setLayout: (id: string, layout: StoreLayout) => void
  setConstraints: (id: string, constraints: Constraints2D) => void
  setFrameRect: (id: string, frame: FrameSnapshot) => void
  setPosition: (id: string, pos: Vec2) => void

  apply: (id: string, action: DragAction) => void
}

export const dragStore = create<DragStore>()(
  immer((set, get) => ({

    bindings: {},
    //tsx only!
    init: (id, fallback) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = fallback
      })
    },

    get: (id) => {
      return get().bindings[id]
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
          containerSize: packet.containerSize,
          itemSize: packet.itemSize,
        }
      })
    },

    setConstraints: (id, constraints) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.constraints = constraints
      })
    },

    setFrameRect(id, packet) {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.frameRect = packet
      })
    },

    setPosition: (id, pos) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.settledOffset = { x: pos.x, y: pos.y }
      })
    },

    apply: (id, action) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        switch (action.event) {
          case 'swipeStart': {
            s.frameRect = action.payload.frameRect ?? s.frameRect

            s.dragging = true
            s.liveOffset = { x: 0, y: 0 }
            break
          }
          case 'swipe': {
            s.liveOffset = action.payload.delta ?? s.liveOffset
            break
          }
          case 'swipeCommit': {
            s.settledOffset = action.payload.delta ?? s.settledOffset
            s.liveOffset = { x: 0, y: 0 }
            s.dragging = false
            break
          }
          default: { throw new Error(`Invalid drag event! Event: ${event}`) }
        }
      })
    }
  }))
)
