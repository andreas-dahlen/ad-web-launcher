import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { StoreLayout } from '@typing/store.types'
import type { Constraints1D } from '@typing/core.types'
import type { SliderAction } from '@interaction/types/runtime/action.types'
export type SliderBinding = {
  //react motion
  value: number         // logical position

  constraints: Constraints1D

  // the optional section non reactive

  layout: StoreLayout
  dragging: boolean
}

export type SliderStore = {
  bindings: Record<string, SliderBinding>
  init: (id: string, fallback: SliderBinding) => void
  get: (id: string) => Readonly<SliderBinding>
  delete: (id: string) => void

  setConstraints: (id: string, constraints: Constraints1D) => void

  setLayout: (id: string, packet: StoreLayout) => void

  apply: (id: string, action: SliderAction) => void
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
        s.constraints = constraints
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

    apply: (id, action) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        switch (action.event) {
          case 'press': {
            s.value = action.payload.delta1D ?? s.value
            break
          }
          case 'swipeStart': {
            s.dragging = true
            s.value = action.payload.delta1D ?? s.value
            break
          }
          case 'swipe': {
            s.value = action.payload.delta1D ?? s.value
            break
          }
          case 'swipeCommit': {
            s.dragging = false
            s.value = action.payload.delta1D ?? s.value
            break
          }
          default: { throw new Error(`Invalid slider event! Event: ${event}`) }
        }
      })
    }
  }))
)