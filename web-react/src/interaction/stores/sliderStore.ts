import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Vec2 } from '../types/primitiveType.ts'
import type { CtxSlider } from '../types/ctxType.ts'

type Slider = {
  //react motion
  value: number         // logical position

  //react sizing
  min: number
  max: number
  size: Vec2

  // the optional section non reactive
  thumbSize: Vec2
  dragging: boolean
}

export type SliderStore = {
  bindings: Record<string, Slider>
  init: (id: string) => void
  get: (id: string) => Readonly<Slider> | null
  delete: (id: string) => void

  setConstraints: (id: string, constraints: { min: number, max: number }) => void
  setSize: (id: string, size: Vec2) => void
  setThumbSize: (id: string, thumbSize: Vec2) => void
  press: (ctx: CtxSlider) => void
  swipeStart: (ctx: CtxSlider) => void
  swipe: (ctx: CtxSlider) => void
  swipeCommit: (ctx: CtxSlider) => void
}
/* -------------------------------
   Slider state functions
--------------------------------- */
export const sliderStore = create<SliderStore>()(
  immer((set, get) => ({

    bindings: {},

    init: (id) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = {
          value: 0,
          min: 0,
          max: 100,
          size: { x: 0, y: 0 },
          thumbSize: { x: 0, y: 0 },
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

    setConstraints: (id, constraints) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.min = constraints.min;
        s.max = constraints.max;
      })
    },

    setSize: (id, size) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.size = size

      })
    },
    setThumbSize: (id, thumbSize) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        if (s.thumbSize.x === thumbSize.x && s.thumbSize.y === thumbSize.y) return
        s.thumbSize = thumbSize
      })
    },
    // if (s.thumbSize === thumbSize)
    press: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.value = ctx.delta1D ?? s.value
      })
    },
    swipeStart: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.dragging = true
        s.value = ctx.delta1D ?? s.value
      })
    },
    swipe: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.value = ctx.delta1D ?? s.value
      })
    },
    swipeCommit: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.dragging = false
        s.value = ctx.delta1D ?? s.value
      })
    },
  })
  )
)