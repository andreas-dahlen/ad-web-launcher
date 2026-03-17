import { createStore } from './stateReactAdapter.ts'
/* -------------------------------
   Types for carousel state
--------------------------------- */
interface CarouselLane {
  index: number
  count: number
  offset: number
  size: Vec2
  dragging: boolean
  settling: boolean
  pendingDir: Direction | null
  lockPrevAt: number | null
  lockNextAt: number | null
}
type CarouselLaneView = {
  offset: number
  index: number
  dragging: boolean
  settling: boolean
  size: Vec2
  count: number
  progress: number
}
/* -------------------------------
   Central carousel state
--------------------------------- */
interface CarouselState {
  lanes: Record<string, CarouselLane>
  views: Record<string, CarouselLaneView>
}
/* -------------------------------
   Initial store
--------------------------------- */
export const useCarouselState = createStore<CarouselState>({
  lanes: {},
  views: {}
})
export const carouselStateFn = {
    /* -------------------------
       Ensure lane exists
  -------------------------- */
  ensure(id: string, s: CarouselState) {
  let lane = s.lanes[id]
  if (!lane) {
    lane = {
      index: 0,
      count: 0,
      offset: 0,
      size: {x: 0, y: 0},
      dragging: false,
      settling: false,
      pendingDir: null,
      lockPrevAt: null,
      lockNextAt: null
    }
    s.lanes[id] = lane // directly mutate the current snapshot
  }
  return lane
},
  /* -------------------------
  Metadata / getters
  -------------------------- */
get(id: string): CarouselLaneView {
  const s = useCarouselState.getSnapshot()
  const lane = this.ensure(id, s)
  if (!s.views[id]) {
    s.views[id] = {
      offset: lane.offset,
      index: lane.index,
      dragging: lane.dragging,
      settling: lane.settling,
      size: lane.size,
      count: lane.count,
      progress: 0
      // progress: lane.size ? lane.offset / lane.size : 0
    }
  }
  return s.views[id]
},

  getNextIndex(currentIndex: number, direction: Direction | null, count: number): number {
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
  },
  getSize(id: string): Vec2 {
    return useCarouselState.getSnapshot().lanes[id]?.size ?? 0
  },
  getCurrentIndex(id: string): number {
    return useCarouselState.getSnapshot().lanes[id]?.index ?? 0
  },
  /* -------------------------
  Configuration / layout
  -------------------------- */
  setCount(id: string, count: number) {
    useCarouselState.setState((s) => {
      this.ensure(id, s).count = Math.max(0, count)
    })
  },

  setSize(id: string, size: Vec2) {
    useCarouselState.setState((s) => {
      this.ensure(id, s).size = size
    })
  },

  setPosition(id: string): boolean {
    useCarouselState.setState((s) => {
      const lane = this.ensure(id, s)
      if (!lane.pendingDir) return false
      lane.settling = true
      lane.index = this.getNextIndex(lane.index, lane.pendingDir, lane.count)
      lane.offset = 0
      lane.pendingDir = null
    })

    setTimeout(() => {
      useCarouselState.setState((s) => {
        const lane = this.ensure(id, s)
        lane.settling = false
      })
    }, 0)
    return true
  },


  /* -------------------------
       Dispatcher / mutations
  -------------------------- */
  swipeStart(desc: Descriptor) {
  useCarouselState.setState((s) => {
    const lane = this.ensure(desc.base.id, s)
    lane.dragging = true
    if (lane.pendingDir !== null) this.setPosition(desc.base.id)
    lane.pendingDir = null
    })
  },

  swipe(desc: Descriptor) {
    useCarouselState.setState((s) => {
    const lane = this.ensure(desc.base.id, s)
     lane.offset = desc.runtime.delta1D ?? lane.offset
     })
  },

  swipeCommit(desc: Descriptor) {
    useCarouselState.setState((s) => {
    const lane = this.ensure(desc.base.id, s)
    lane.pendingDir = desc.runtime.direction ?? null
    lane.offset = desc.runtime.delta1D ?? lane.offset
    lane.dragging = false
    })
  },

  swipeRevert(desc: Descriptor) {
    useCarouselState.setState((s) => {
    const lane = this.ensure(desc.base.id, s)
    lane.offset = 0
    lane.dragging = false
    lane.pendingDir = null
    })
  }
}