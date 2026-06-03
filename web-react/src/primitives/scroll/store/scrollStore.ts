import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { EventType, Size2D } from '@typing/core.types'
import type { ScrollSolution } from '@interaction/types/Runtime.types'

type Scroll = {
  //react motion
  overflowValue: number
  isVisible: boolean

  liveValue: number
  //reactPosition
  settledValue: number

  velocity: number

  // the optional section non reactive
  dragging: boolean
  containerSize: Size2D
  contentSize: Size2D
}

type AcceptedScroll = Extract<ScrollSolution, { storeAccepted: true }>

export type ScrollStore = {
  bindings: Record<string, Scroll>
  init: (id: string, fallback: Scroll) => void
  get: (id: string) => Readonly<Scroll> | null
  delete: (id: string) => void

  setContainerSize: (id: string, containerSize: Size2D) => void
  setContentSize: (id: string, contentSize: Size2D) => void

  apply: (id: string, event: EventType, solv: AcceptedScroll) => void
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

    apply: (id, event, solv) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        switch (event) {
          case 'press': { //only happens during scroll
            s.liveValue = solv.delta1D ?? s.liveValue
            s.isVisible = true
            break
          }
          case 'swipeStart': {
            s.dragging = true
            s.liveValue = solv.delta1D ?? s.liveValue
            s.overflowValue = solv.overflowValue ?? s.overflowValue
            s.isVisible = solv.isVisible ?? s.isVisible
            break
          }
          case 'swipe': {
            const newValue = solv.delta1D ?? s.liveValue
            s.velocity = newValue - s.liveValue
            s.liveValue = newValue
            s.overflowValue = solv.overflowValue ?? s.overflowValue
            break
          }
          case 'swipeCommit': {
            s.dragging = false
            s.isVisible = solv.isVisible ?? s.isVisible
            s.settledValue = solv.delta1D ?? s.liveValue
            s.liveValue = solv.delta1D ?? s.liveValue
            s.overflowValue = solv.overflowValue ?? s.overflowValue
            if (solv.delta1D !== undefined) startMomentum(id, s.velocity)
            s.velocity = 0
            break
          }
          case 'swipeRevert': {
            s.dragging = false
            s.isVisible = solv.isVisible ?? s.isVisible
            s.overflowValue = solv.overflowValue ?? s.overflowValue
            s.liveValue = 0
            s.settledValue = 0
            break
          }
          default: { throw new Error(`Invalid scroll event! Event: ${event}`) }
        }
      })
    }
  })
  )
)

// function startMomentum(id: string, initialVelocity: number) {
//   let velocity = initialVelocity

//   function tick() {
//     velocity *= 0.95  // friction — tweak this

//     if (Math.abs(velocity) < 0.5) return  // done

//     scrollStore.setState(state => {
//       const s = state.bindings[id]
//       if (!s) return
//       const maxScroll = Math.max(0, s.contentSize.height - s.containerSize.height)
//       s.liveValue = Math.max(0, Math.min(maxScroll, s.liveValue + velocity))
//       s.settledValue = s.liveValue
//     })

//     requestAnimationFrame(tick)
//   }

//   requestAnimationFrame(tick)
// }

const MOMENTUM = {
  durationMs: 600,
  distanceMultiplier: 4
} as const

function startMomentum(id: string, initialVelocity: number) {
  const friction = Math.exp(-76.7 / MOMENTUM.durationMs)
  let velocity = initialVelocity * MOMENTUM.distanceMultiplier

  function tick() {
    velocity *= friction
    if (Math.abs(velocity) < 0.5) return

    scrollStore.setState(state => {
      const s = state.bindings[id]
      if (!s) return
      const maxScroll = Math.max(0, s.contentSize.height - s.containerSize.height)
      s.liveValue = Math.max(0, Math.min(maxScroll, s.liveValue + velocity))
      s.settledValue = s.liveValue
    })

    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}