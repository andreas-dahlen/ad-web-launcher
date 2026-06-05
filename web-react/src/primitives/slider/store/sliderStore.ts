import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { EventType } from '@typing/core.types'
import type { SliderSolution } from '@interaction/types/Runtime.types'
import type { StoreLayout } from '@typing/store.types'

type Slider = {
  //react motion
  value: number         // logical position

  //react sizing
  min: number
  max: number

  // the optional section non reactive

  layout: StoreLayout
  dragging: boolean
}

type AcceptedSlider = Extract<SliderSolution, { storeAccepted: true }>

export type SliderStore = {
  bindings: Record<string, Slider>
  init: (id: string, fallback: Slider) => void
  get: (id: string) => Readonly<Slider>
  delete: (id: string) => void

  setConstraints: (id: string, constraints: { min: number, max: number }) => void

  setLayout: (id: string, packet: StoreLayout) => void

  apply: (id: string, event: EventType, solv: AcceptedSlider) => void
}
/* -------------------------------
   Slider state functions
--------------------------------- */
export const sliderStore = create<SliderStore>()(
  immer((set, get) => ({

    bindings: {},

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

    setConstraints: (id, constraints) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.min = constraints.min;
        s.max = constraints.max;
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