// import { state } from "@interaction/state/stateManager"
import { immer } from "zustand/middleware/immer"
// import { shallow } from "zustand/shallow"
import { create } from 'zustand'
import type { Direction, Vec2 } from "@interaction/types/primitives.ts"
import type { CarouselDescriptor } from "@interaction/types/descriptor.ts"

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

  swipeStart: (desc: CarouselDescriptor) => void
  swipe: (desc: CarouselDescriptor) => void
  swipeCommit: (desc: CarouselDescriptor) => void
  swipeRevert: (desc: CarouselDescriptor) => void
}

export const carouselStore = create<CarouselStore>()(
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
    setSize: (id, trackSize) => {
      set(state => {
        state.carouselStore[id].size = trackSize
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

    swipeStart: (desc) => {
      set(state => {
        const s = state.carouselStore[desc.base.id]
        s.dragging = true
        s.settling = false
        if (s.pendingDir !== null) {
          s.index = getNextIndex(s.index, s.pendingDir, s.count)
          s.offset = 0
          s.pendingDir = null
        }
      })
    },

    swipe: (desc) => {
      set(state => {
        const offset = desc.solutions.delta1D
        if (offset) state.carouselStore[desc.base.id].offset = offset
      })
    },
    swipeCommit: (desc) => {
      set(state => {
        const s = state.carouselStore[desc.base.id]
        if (s.settling) return
        s.pendingDir = desc.solutions.direction ?? null
        s.offset = desc.solutions.delta1D ?? s.offset
        s.dragging = false
      })
    },
    swipeRevert: (desc) => {
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
  if (!count ||!direction) return currentIndex
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


// export const getCarousel = (id: string) => {
//   const c = useStore.getState().carouselStore[id]
//   if (!c) throw new Error(`Carousel ${id} not initialized`)
//   return c
// }

// export const mutateCarousel = (id: string, fn: (c: Carousel) => void) => {
//   useStore.setState(state => {
//     const c = state.carouselStore[id]
//     if (!c) throw new Error(`Carousel ${id} not initialized`)
//     fn(c)
//   })
// }


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

// export const useCarouselMotion = (id: string) =>
//   carouselStore(
//     useShallow(s => {
//       const c = s.carouselStore[id]
//       // Important: Guard against undefined if the component renders before init()
//       if (!c) return { offset: 0, dragging: false } 
      
//       return { offset: c.offset, dragging: c.dragging }
//     })
//   )

// export const useCarouselScene = (id: string) =>
//   carouselStore(
//     useShallow(s => {
//       const c = s.carouselStore[id]
//       if (!c) return { index: 0, count: 0 }
      
//       return { index: c.index, count: c.count }
//     })
//   )