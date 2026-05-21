import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Size2D } from '../typeScript/core/primitiveType.ts'
import type { CtxSlider } from '../typeScript/descriptor/ctxType.ts'

type Slider = {
  //react motion
  value: number         // logical position

  //react sizing
  min: number
  max: number
  containerSize: Size2D

  // the optional section non reactive
  thumbSize: Size2D
  dragging: boolean
}

export type SliderStore = {
  bindings: Record<string, Slider>
  init: (id: string) => void
  get: (id: string) => Readonly<Slider> | null
  delete: (id: string) => void

  setConstraints: (id: string, constraints: { min: number, max: number }) => void
  setContainerSize: (id: string, containerSize: Size2D) => void
  setThumbSize: (id: string, thumbSize: Size2D) => void

  apply: (ctx: CtxSlider) => void


  // press: (ctx: CtxSlider) => void
  // swipeStart: (ctx: CtxSlider) => void
  // swipe: (ctx: CtxSlider) => void
  // swipeCommit: (ctx: CtxSlider) => void
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
          containerSize: { width: 0, height: 0 },
          thumbSize: { width: 0, height: 0 },
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

    setContainerSize: (id, containerSize) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        if (s.containerSize.width === containerSize.width && s.containerSize.height === containerSize.height) return
        s.containerSize = containerSize

      })
    },
    setThumbSize: (id, thumbSize) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        if (s.thumbSize.width === thumbSize.width && s.thumbSize.height === thumbSize.height) return
        s.thumbSize = thumbSize
      })
    },
    // if (s.thumbSize === thumbSize)
    // press: (ctx) => {
    //   set(state => {
    //     const s = state.bindings[ctx.id]
    //     if (!s) return
    //     s.value = ctx.delta1D ?? s.value
    //   })
    // },
    // swipeStart: (ctx) => {
    //   set(state => {
    //     const s = state.bindings[ctx.id]
    //     if (!s) return
    //     s.dragging = true
    //     s.value = ctx.delta1D ?? s.value
    //   })
    // },
    // swipe: (ctx) => {
    //   set(state => {
    //     const s = state.bindings[ctx.id]
    //     if (!s) return
    //     s.value = ctx.delta1D ?? s.value
    //   })
    // },
    // swipeCommit: (ctx) => {
    //   set(state => {
    //     const s = state.bindings[ctx.id]
    //     if (!s) return
    //     s.dragging = false
    //     s.value = ctx.delta1D ?? s.value
    //   })
    // },

    apply: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        switch (ctx.event) {
          case 'press': {
            s.value = ctx.delta1D ?? s.value
            break
          }
          case 'swipeStart': {
            s.dragging = true
            s.value = ctx.delta1D ?? s.value
            break
          }
          case 'swipe': {
            s.value = ctx.delta1D ?? s.value
            break
          }
          case 'swipeCommit': {
            s.dragging = false
            s.value = ctx.delta1D ?? s.value
            break
          }
          default: { throw new Error(`Invalid carousel event! Event: ${ctx.event}`) }
        }
      })
    }
  })
  )
)