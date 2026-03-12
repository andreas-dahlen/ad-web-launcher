import { nextTick } from 'vue'
import type { Descriptor, Direction } from '../../types/gestures.ts'

/* -------------------------------
   Types for carousel state
--------------------------------- */
interface CarouselLane {
  index: number
  count: number
  offset: number
  size: number
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
  size: number
  count: number
  progress: number
}

/* -------------------------------
   Central carousel state
--------------------------------- */
const carouselState: Record<string, CarouselLane> = {}
const laneViews: Record<string, CarouselLaneView> = {}

export const carouselStateFn = {
  /* -------------------------
       Metadata / getters
  -------------------------- */
  getSize(id: string): number {
    return carouselState[id]?.size ?? 0
  },

  getCurrentIndex(id: string): number {
    return carouselState[id]?.index ?? 0
  },

  get(id: string): CarouselLaneView {
    const lane = this.ensure(id)

    if (!laneViews[id]) {
      laneViews[id] = {
        offset: lane.offset,
        index: lane.index,
        dragging: lane.dragging,
        settling: lane.settling,
        size: lane.size,
        count: lane.count,
        progress: lane.size ? lane.offset / lane.size : 0
      }
    }

    return laneViews[id]
  },

  /* -------------------------
       Ensure lane exists
  -------------------------- */
  ensure(id: string): CarouselLane {
    if (!carouselState[id]) {
      carouselState[id] = {
        index: 0,
        count: 0,
        offset: 0,
        size: 0,
        dragging: false,
        settling: false,
        pendingDir: null,
        lockPrevAt: null,
        lockNextAt: null
      }
    }
    return carouselState[id]
  },

  /* -------------------------
       Configuration / layout
  -------------------------- */
  setCount(id: string, count: number) {
    const lane = this.ensure(id)
    lane.count = Math.max(0, count)
  },

  setSize(id: string, size: number) {
    this.ensure(id).size = size
  },

  setPosition(id: string): boolean {
    const lane = this.ensure(id)
    if (!lane.pendingDir) return false

    lane.settling = true
    lane.index = this.getNextIndex(lane.index, lane.pendingDir, lane.count)
    lane.offset = 0
    lane.pendingDir = null

    nextTick(() => {
      lane.settling = false
    })

    return true
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

  /* -------------------------
       Dispatcher / mutations
  -------------------------- */
  swipeStart(desc: Descriptor) {
    const lane = this.ensure(desc.id)
    lane.dragging = true
    if (lane.pendingDir !== null) this.setPosition(desc.id)
    lane.pendingDir = null
  },

  swipe(desc: Descriptor) {
    this.ensure(desc.id).offset = desc.delta as number
  },

  swipeCommit(desc: Descriptor) {
    const { direction, delta, id } = desc
    const lane = this.ensure(id)
    lane.pendingDir = direction ?? null
    lane.offset = delta as number
    lane.dragging = false
  },

  swipeRevert(desc: Descriptor) {
    const lane = this.ensure(desc.id)
    lane.offset = 0
    lane.dragging = false
    lane.pendingDir = null
  }
}