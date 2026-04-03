// import { state } from "@interaction/state/stateManager"
import { immer } from "zustand/middleware/immer"
// import { shallow } from "zustand/shallow"
import { create } from 'zustand'
import type { Direction, Vec2 } from "@interaction/types/primitiveType"
import type { CtxCarousel } from '@interaction/types/ctxType'

type Carousel = {
  //react motion
  index: number
  offset: number

  //reactScenes
  count: number
  size: Vec2
  dragging: boolean

  //read only... not used by react..?:
  // scenes: number[]
  settling: boolean
  pendingDir: Direction | null
}

export type CarouselStore = {
  carouselStore: Record<string, Carousel>
  init: (id: string) => void
  get: (id: string) => Readonly<Carousel>

  setCount: (id: string, count: number) => void
  // setScenes: (id: string, scenes: number[]) => void
  setSize: (id: string, trackSize: Vec2) => void
  setPosition: (id: string) => void

  swipeStart: (ctx: CtxCarousel) => void
  swipe: (ctx: CtxCarousel) => void
  swipeCommit: (ctx: CtxCarousel) => void
  swipeRevert: (ctx: CtxCarousel) => void
}

export const carouselStore = create<CarouselStore>()(
  immer((set, get) => ({

    carouselStore: {},

    init: (id) => {
      if (get().carouselStore[id]) return

      set(state => {
        state.carouselStore[id] = {
          index: 0,
          offset: 0,

          count: 0,
          size: { x: 0, y: 0 },
          dragging: false,

          // scenes: [0,1,2],
          settling: false,
          pendingDir: null,
          //lockPrev/lockNextAt feels unneeded..
        }
      })
    },

    //ensure should not be needed... should be init for a fact because of react component...
    get: (id) => {
      return get().carouselStore[id] ?? null
    },

    // setScenes: (id, scenes) => {
    //   set(state => {
    //     state.carouselStore[id].scenes = scenes
    //   })
    // },
    setCount: (id, count) => {
      set(state => {
        const s = state.carouselStore[id]
        if (!s) return
        s.count = Math.max(0, count)
      })
    },
    setSize: (id, trackSize) => {
      set(state => {
        const s = state.carouselStore[id]
        if (!s) return
        if (s.size.x === trackSize.x && s.size.y === trackSize.y) return
        s.size = trackSize
      })
    },
    setPosition: (id) => {
      const s = get().carouselStore[id]
      if (!s?.pendingDir) return
      set(state => {
        const s = state.carouselStore[id]
        s.settling = true
        s.index = getNextIndex(s.index, s.pendingDir, s.count)
        s.offset = 0
        s.pendingDir = null
      })
      requestAnimationFrame(() => {
        set(state => {
          const s = state.carouselStore[id]
          if (!s) return
          s.settling = false
        })
      })
    },

    swipeStart: (ctx) => {
      set(state => {
        const s = state.carouselStore[ctx.id]
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
        const s = state.carouselStore[ctx.id]
        if (!s) return
        s.offset = ctx.delta1D ?? s.offset
      })
    },
    swipeCommit: (ctx) => {
      set(state => {
        const s = state.carouselStore[ctx.id]
        if (!s) return
        if (s.settling) return
        s.pendingDir = ctx.direction ?? null
        s.offset = ctx.delta1D ?? s.offset
        s.dragging = false
      })
    },
    swipeRevert: (ctx) => {
      set(state => {
        const s = state.carouselStore[ctx.id]
        if (!s) return
        s.offset = 0
        s.dragging = false
        s.pendingDir = null
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