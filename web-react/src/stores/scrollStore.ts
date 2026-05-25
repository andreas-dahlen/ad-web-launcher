import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Size2D } from '../typeScript/core/primitiveType.ts'
import type { CtxScroll } from '../typeScript/descriptor/ctxType.ts'

type Scroll = {
  //react motion
  //react motion
  liveValue: number
  //reactPosition
  settledValue: number
  //react sizing
  containerSize: Size2D
  contentSize: Size2D

  // the optional section non reactive
  dragging: boolean
}

export type ScrollStore = {
  bindings: Record<string, Scroll>
  init: (id: string) => void
  get: (id: string) => Readonly<Scroll> | null
  delete: (id: string) => void

  setContainerSize: (id: string, containerSize: Size2D) => void
  setContentSize: (id: string, contentSize: Size2D) => void

  apply: (ctx: CtxScroll) => void
}
/* -------------------------------
   scroll state functions
--------------------------------- */
export const scrollStore = create<ScrollStore>()(
  immer((set, get) => ({

    bindings: {},

    init: (id) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = {
          liveValue: 0,
          settledValue: 0,
          containerSize: { width: 0, height: 0 },
          contentSize: { width: 0, height: 0 },
          dragging: false
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
    setContainerSize: (id, containerSize) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        if (s.containerSize.width === containerSize.width && s.containerSize.height === containerSize.height) return
        s.containerSize = containerSize

      })
    },
    setContentSize: (id, contentSize) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        if (s.contentSize.width === contentSize.width && s.contentSize.height === contentSize.height) return
        s.contentSize = contentSize
      })
    },

    apply: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        switch (ctx.event) {
          case 'press': {
            s.liveValue = ctx.delta1D ?? s.liveValue
            break
          }
          case 'swipeStart': {
            s.dragging = true
            s.liveValue = ctx.delta1D ?? s.liveValue
            break
          }
          case 'swipe': {
            s.liveValue = ctx.delta1D ?? s.liveValue
            break
          }
          case 'swipeCommit': {
            s.dragging = false
            s.settledValue = ctx.delta1D ?? s.liveValue
            s.liveValue = ctx.delta1D ?? s.liveValue
            break
          }
          default: { throw new Error(`Invalid scroll event! Event: ${ctx.event}`) }
        }
      })
    }
  })
  )
)