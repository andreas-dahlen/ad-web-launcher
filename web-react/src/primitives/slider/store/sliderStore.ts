import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { EventType, Size2D } from '@typing/core.types'
import type { SliderSolution } from '@interaction/types/Runtime.types'

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

type AcceptedSlider = Extract<SliderSolution, { storeAccepted: true }>

export type SliderStore = {
  bindings: Record<string, Slider>
  init: (id: string) => void
  get: (id: string) => Readonly<Slider> | null
  delete: (id: string) => void

  setConstraints: (id: string, constraints: { min: number, max: number }) => void
  setContainerSize: (id: string, containerSize: Size2D) => void
  setThumbSize: (id: string, thumbSize: Size2D) => void

  apply: (id: string, event: EventType, solv: AcceptedSlider) => void
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

    apply: (id, event, solv) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        switch (event) {
          case 'press': {
            s.value = solv.delta1D ?? s.value
            break
          }
          case 'swipeStart': {
            s.dragging = true
            s.value = solv.delta1D ?? s.value
            break
          }
          case 'swipe': {
            s.value = solv.delta1D ?? s.value
            break
          }
          case 'swipeCommit': {
            s.dragging = false
            s.value = solv.delta1D ?? s.value
            break
          }
          default: { throw new Error(`Invalid slider event! Event: ${event}`) }
        }
      })
    }
  })
  )
)