// import { state } from "@interaction/state/stateManager"
import { immer } from "zustand/middleware/immer"
// import { shallow } from "zustand/shallow"
import { createWithEqualityFn } from 'zustand/traditional'
import type { Direction, Vec2 } from "@interaction/types/primitives"
import type { Descriptor } from "@interaction/types/descriptor"

type Carousel = {
  //react motion
  index: number
  offset: number

  //reactScenes
  count: number
  trackSize: Vec2 //renamed from size... should be reactive...??
  dragging: boolean

  //read only... not used by react..?:
  // scenes: number[]
  settling: boolean
  pendingDir: Direction | null
}

export type Store = {
  carouselStore: Record<string, Carousel>
  init: (id: string) => void
  get: (id: string) => Readonly<Carousel>

  setCount: (id: string, count: number) => void
  // setScenes: (id: string, scenes: number[]) => void
  setTrackSize: (id: string, trackSize: Vec2) => void
  setPosition: (id: string) => void

  swipe: (desc: Descriptor) => void
  swipeRevert: (desc: Descriptor) => void
  swipeCommit: (desc: Descriptor) => void
}

export const carouselStore = createWithEqualityFn<Store>()(
  immer((set, get) => ({

    carouselStore: {},

    //tsx only!
    init: (id) => {
      if (get().carouselStore[id]) return

      set(state => {
        state.carouselStore[id] = {
          index: 0,
          offset: 0,

          count: 0,
          trackSize: { x: 0, y: 0 },
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
      return Object.freeze(get().carouselStore[id])
    },

    // setScenes: (id, scenes) => {
    //   set(state => {
    //     state.carouselStore[id].scenes = scenes
    //   })
    // },
    setCount: (id, count) => {
      set(state => {
        state.carouselStore[id].count = count
      })
    },
    setTrackSize: (id, trackSize) => {
      set(state => {
        state.carouselStore[id].trackSize = trackSize
      })
    },
    setPosition: (id) => {
      set(state => {
        const s = state.carouselStore[id]
        s.settling = true
        s.index = getNextIndex(s.index, s.pendingDir, s.count)
        s.offset = 0
        s.pendingDir = null
      })
      requestAnimationFrame(() => {
        set(state => {
          state.carouselStore[id].settling = false
        })
      })
    },

    swipeStart: (desc: Descriptor) => {
      set(state => {
        const s = state.carouselStore[desc.base.id]
        s.dragging = true
        s.settling = false
        if (s.pendingDir !== null) {
          s.index = this.getNextIndex(s.index, s.pendingDir, s.count)
          s.offset = 0
          s.pendingDir = null
        }
      })
    },

    swipe: (desc: Descriptor) => {
      set(state => {
        const offset = desc.runtime.delta1D
        if (offset) state.carouselStore[desc.base.id].offset = offset
      })
    },
    swipeCommit: (desc: Descriptor) => {
      set(state => {
        const s = state.carouselStore[desc.base.id]
        if (s.settling) return
        s.pendingDir = desc.runtime.direction ?? null
        s.offset = desc.runtime.delta1D ?? s.offset
        s.dragging = false
      })
    },
    swipeRevert: (desc: Descriptor) => {
      set(state => {
        const s = state.carouselStore[desc.base.id]
        s.offset = 0
        s.dragging = false
        s.pendingDir = null
      })
    }
  })
  )
)

function getNextIndex(currentIndex: number, direction: Direction | null, count: number): number {
  if (!count) return 0
  switch (direction) {
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


export const getCarousel = (id: string) => {
  const c = useStore.getState().carouselStore[id]
  if (!c) throw new Error(`Carousel ${id} not initialized`)
  return c
}

export const mutateCarousel = (id: string, fn: (c: Carousel) => void) => {
  useStore.setState(state => {
    const c = state.carouselStore[id]
    if (!c) throw new Error(`Carousel ${id} not initialized`)
    fn(c)
  })
}


/* =========================================================
API
========================================================= */
// const c = getCarousel(id)

// mutateCarousel(id, c => {
// c.offset = newOffset
// c.dragging = true
// })

/* =========================================================
HOOKS
========================================================= */

// export const subscribeToCarouselMotion = (id: string) =>
//   useStore(
//     s => {
//       const c = s.carouselStore[id]
//       return { offset: c.offset, dragging: c.dragging }
//     },
//     shallow
//   )

// export const subscribeToCarouselScene = (id: string) =>
//   useStore(
//     s => {
//       const c = s.carouselStore[id]
//       return { index: c.index, count: c.count }
//     },
//     shallow
//   )