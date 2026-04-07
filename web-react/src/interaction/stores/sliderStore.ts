import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Vec2 } from '@interaction/types/primitiveType'
import type { CtxSlider } from '@interaction/types/ctxType'

type Slider = {
  //react motion
  value: number         // logical position
  offset: number        // live drag offset

  //react sizing
  min: number
  max: number
  size: Vec2

  // the optional section non reactive
  thumbSize: Vec2
  dragging?: boolean

}

export type SliderStore = {
  sliderStore: Record<string, Slider>
  init: (id: string) => void
  get: (id: string) => Readonly<Slider>
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

    sliderStore: {},

    init: (id) => {
      if (get().sliderStore[id]) return

      set(state => {
        state.sliderStore[id] = {
          value: 0,
          offset: 0,
          min: 0,
          max: 100,
          size: { x: 0, y: 0 },
          thumbSize: { x: 0, y: 0 }
        }
      })
    },
    get: (id) => {
      return get().sliderStore[id] ?? null
    },

    delete: (id: string) => {
      set(state => {
        delete state.sliderStore[id]
      })
    },

    setConstraints: (id, constraints) => {
      set(state => {
        const s = state.sliderStore[id]
        if (!s) return
        s.min = constraints.min;
        s.max = constraints.max;
      })
    },

    setSize: (id, size) => {
      set(state => {
        const s = state.sliderStore[id]
        if (!s) return
        s.size = size

      })
    },
    setThumbSize: (id, thumbSize) => {
      set(state => {
        const s = state.sliderStore[id]
        if (!s) return
        if (thumbSize !== undefined) s.thumbSize = thumbSize;
      })
    },
    press: (ctx) => {
      set(state => {
        const s = state.sliderStore[ctx.id]
        if (!s) return
        s.value = ctx.delta1D ?? s.value
      })
    },
    swipeStart: (ctx) => {
      set(state => {
        const s = state.sliderStore[ctx.id]
        if (!s) return
        s.dragging = true
        s.value = ctx.delta1D ?? s.value
      })
    },
    swipe: (ctx) => {
      set(state => {
        const s = state.sliderStore[ctx.id]
        if (!s) return
        s.value = ctx.delta1D ?? s.value
      })
    },
    swipeCommit: (ctx) => {
      set(state => {
        const s = state.sliderStore[ctx.id]
        if (!s) return
        s.dragging = false
        s.value = ctx.delta1D ?? s.value
      })
    },
  })
  )
)