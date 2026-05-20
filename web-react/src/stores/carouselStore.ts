import { immer } from "zustand/middleware/immer"
import { create } from 'zustand'
import type { Direction, Vec2 } from "../typeScript/core/primitiveType.ts"
import type { CtxCarousel } from '../typeScript/descriptor/ctxType.ts'

type Carousel = {
  //react motion
  index: number
  liveOffset: number

  //reactScenes
  count: number
  sceneSize: Vec2
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
  setSize: (id: string, sceneSize: Vec2) => void
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
          liveOffset: 0,

          count: 0,
          sceneSize: { x: 0, y: 0 },
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
        if (s.sceneSize.x === sceneSize.x && s.sceneSize.y === sceneSize.y) return
        s.sceneSize = sceneSize
      })
    },

    swipeStart: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.dragging = true
        s.settling = false
        if (s.pendingDir !== null) {
          s.index = getNextIndex(s.index, s.pendingDir, s.count)
          s.liveOffset = 0
          s.pendingDir = null
        }
      })
    },

    swipe: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.liveOffset = ctx.delta1D ?? s.liveOffset
      })
    },
    swipeCommit: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        if (s.settling) return
        s.pendingDir = ctx.direction ?? null
        s.liveOffset = ctx.delta1D ?? s.liveOffset
        s.dragging = false
      })
    },
    swipeRevert: (ctx) => {
      set(state => {
        const s = state.bindings[ctx.id]
        if (!s) return
        s.liveOffset = 0
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