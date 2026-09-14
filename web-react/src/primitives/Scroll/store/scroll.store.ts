import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { StoreLayout } from '@shared/types/store.types.ts'
import type { ScrollAction } from '@interaction/types/runtime/action.types.ts'
import { assertNever } from '@shared/assertions/assertions.ts'

export type ScrollBinding = {
  //react motion
  overflowValue: number
  isVisible: boolean

  liveValue: number
  //reactPosition
  settledValue: number

  velocity: number

  // the optional section non reactive
  dragging: boolean

  layout: StoreLayout
}

export type ScrollStore = {
  bindings: Record<string, ScrollBinding>
  init: (id: string, fallback: ScrollBinding) => void
  get: (id: string) => Readonly<ScrollBinding>
  delete: (id: string) => void

  setLayout: (id: string, packet: StoreLayout) => void

  apply: (id: string, action: ScrollAction) => void
}
/* -------------------------------
   scroll state functions
--------------------------------- */
export const scrollStore = create<ScrollStore>()(
  immer((set, get) => ({

    bindings: {},

    init: (id, fallback) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = {
          ...fallback
        }
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

    apply: (id, action) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        switch (action.event) {
          case 'swipeStart': {
            s.dragging = true
            if (action.payload.isOverflow) {
              // s.overflowValue = action.payload.overflowValue
            } else {
              s.liveValue = action.payload.delta1D
            }
            break
          }
          case 'swipe': {
            if (action.payload.isOverflow) {
              s.overflowValue = action.payload.overflowValue
            } else {
              const newValue = action.payload.delta1D
              s.velocity = newValue - s.liveValue
              s.liveValue = newValue
            }
            break
          }
          case 'swipeCommit': {
            s.dragging = false
            s.isVisible = action.payload.isVisible
            if (action.payload.isOverflow) {
              s.overflowValue = action.payload.overflowValue
            } else {
              s.settledValue = action.payload.delta1D
              s.liveValue = action.payload.delta1D
              startMomentum(id, s.velocity)
            }
            s.velocity = 0
            break
          }
          case 'swipeRevert': {
            s.dragging = false
            s.isVisible = action.payload.isVisible
            s.overflowValue = action.payload.overflowValue
            s.liveValue = 0
            s.settledValue = 0
            break
          }
          default: assertNever(action)
        }
      })
    }
  }))
)

const MOMENTUM = {
  durationMs: 600,
  distanceMultiplier: 4
} as const //TODO move to settings or whatever... consts app settings

function startMomentum(id: string, initialVelocity: number) {
  const friction = Math.exp(-76.7 / MOMENTUM.durationMs)
  let velocity = initialVelocity * MOMENTUM.distanceMultiplier

  function tick() {
    velocity *= friction
    if (Math.abs(velocity) < 0.5) return

    scrollStore.setState(state => {
      const s = state.bindings[id]
      if (!s) return
      const maxScroll = Math.max(0, s.layout.itemSize.height - s.layout.containerSize.height)
      s.liveValue = Math.max(0, Math.min(maxScroll, s.liveValue + velocity))
      s.settledValue = s.liveValue
    })

    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}