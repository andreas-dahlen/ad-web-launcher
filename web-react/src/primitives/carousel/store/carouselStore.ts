import { immer } from "zustand/middleware/immer"
import { create } from 'zustand'
import type { Direction, Size2D } from '../../../shared/typing/core.types'
import type { CtxCarousel } from '@interaction/types/Runtime.types'

type Carousel = {
  //react motion
  index: number
  liveOffset: number

  //reactScenes
  count: number
  sceneSize: Size2D
  dragging: boolean

  //read only... not used by react
  settling: boolean
  pendingDir: Direction | null
}

export type CarouselStore = {
  bindings: Record<string, Carousel>
  init: (id: string) => void
  get: (id: string) => Readonly<Carousel> | null
  delete: (id: string) => void

  setCount: (id: string, count: number) => void
  setSize: (id: string, sceneSize: Size2D) => void

  setSettling: (id: string) => void

  apply: (ctx: CtxCarousel) => void
}

export const carouselStore = create<CarouselStore>()(
  immer((set, get) => ({

    bindings: {},

    init: (id) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = {
          index: 0,
          liveOffset: 0,

          count: 0,
          sceneSize: { width: 0, height: 0 },
          dragging: false,

          settling: false,
          pendingDir: null,
          //lockPrev/lockNextAt TODO could have null values as defaults
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

    setCount: (id, count) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.count = Math.max(0, count)
      })
    },
    setSize: (id, sceneSize) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        if (s.sceneSize.width === sceneSize.width && s.sceneSize.height === sceneSize.height) return
        s.sceneSize = sceneSize
      })
    },

    /**
 * Commits pendingDir → index immediately after the swipe animation completes.
 * Without this, index only updates on the next swipeStart — fine visually,
 * but unreliable for anything that needs to know which scene is current.
 * Called from onTransitionEnd in useCarouselMotion.
 */
    setSettling: (id) => {
      set(state => {
        const s = state.bindings[id]
        if (!s?.pendingDir) return
        s.settling = true
        s.index = getNextIndex(s.index, s.pendingDir, s.count)
        s.liveOffset = 0
        s.pendingDir = null
      })
      requestAnimationFrame(() => {
        set(state => {
          const s = state.bindings[id]
          if (!s) return
          s.settling = false
        })
      })
    },

    apply: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return

        switch (ctx.event) {
          case 'swipeStart': {
            s.dragging = true
            s.settling = false
            if (s.pendingDir !== null) {
              s.index = getNextIndex(s.index, s.pendingDir, s.count)
              s.liveOffset = 0
              s.pendingDir = null
            }
            break
          }
          case 'swipe': {
            s.liveOffset = ctx.delta1D ?? s.liveOffset
            break
          }
          case 'swipeCommit': {
            if (s.settling) return
            s.pendingDir = ctx.direction ?? null
            s.liveOffset = ctx.delta1D ?? s.liveOffset
            s.dragging = false
            break
          }
          case 'swipeRevert': {
            s.liveOffset = 0
            s.dragging = false
            s.pendingDir = null
            break
          }
          default: { throw new Error(`Invalid carousel event! Event: ${ctx.event}`) }
        }
      })
    }

  })
  )
)

function getNextIndex(currentIndex: number, direction: Direction | null, count: number): number {
  if (!count || !direction) return currentIndex
  switch (direction.dir) {
    case 'right':
    case 'down':
      return (currentIndex - 1 + count) % count
    case 'left':
    case 'up':
      return (currentIndex + 1) % count
    default:
      return currentIndex
  }
}