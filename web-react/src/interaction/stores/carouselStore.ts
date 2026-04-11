import { immer } from "zustand/middleware/immer"
import { create } from 'zustand'
import type { Direction, Vec2 } from "../../typeScript/primitiveType.ts"
import type { CtxCarousel } from '../../typeScript/ctxType.ts'

type Carousel = {
  //react motion
  index: number
  offset: number

  //reactScenes
  count: number
  size: Vec2
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
  setSize: (id: string, trackSize: Vec2) => void
  // setPosition: (id: string) => void

  swipeStart: (ctx: CtxCarousel) => void
  swipe: (ctx: CtxCarousel) => void
  swipeCommit: (ctx: CtxCarousel) => void
  swipeRevert: (ctx: CtxCarousel) => void
}

export const carouselStore = create<CarouselStore>()(
  immer((set, get) => ({

    bindings: {},

    init: (id) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = {
          index: 0,
          offset: 0,

          count: 0,
          size: { x: 0, y: 0 },
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
    setSize: (id, trackSize) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        if (s.size.x === trackSize.x && s.size.y === trackSize.y) return
        s.size = trackSize
      })
    },
    // setPosition: (id) => {
    //   const s = get().bindings[id]
    //   if (!s?.pendingDir) return
    //   set(state => {
    //     const s = state.bindings[id]
    //     s.settling = true
    //     s.index = getNextIndex(s.index, s.pendingDir, s.count)
    //     s.offset = 0
    //     s.pendingDir = null
    //   })
    //   requestAnimationFrame(() => {
    //     set(state => {
    //       const s = state.bindings[id]
    //       if (!s) return
    //       s.settling = false
    //     })
    //   })
    // },

    swipeStart: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.dragging = true
        s.settling = false
        if (s.pendingDir !== null) {
          s.index = getNextIndex(s.index, s.pendingDir, s.count)
          s.offset = 0
          s.pendingDir = null
        }
      })
    },

    swipe: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.offset = ctx.delta1D ?? s.offset
      })
    },
    swipeCommit: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        if (s.settling) return
        s.pendingDir = ctx.direction ?? null
        s.offset = ctx.delta1D ?? s.offset
        s.dragging = false
      })
    },
    swipeRevert: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.offset = 0
        s.dragging = false
        s.pendingDir = null
      })
    },
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