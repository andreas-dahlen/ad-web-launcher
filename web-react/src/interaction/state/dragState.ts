import type { Descriptor, Vec2 } from '../../types/gestures'

/* -------------------------------
   Types for drag state
--------------------------------- */
interface DragLane {
  position: Vec2      // committed position
  offset: Vec2        // live offset during drag
  size: number        // optional lane size
  dragging: boolean
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
}

interface DragLaneView {
  position: Vec2
  offset: Vec2
  dragging: boolean
}

/* -------------------------------
   Central drag state
--------------------------------- */
const ZERO_POINT: Vec2 = { x: 0, y: 0 }

const dragState: Record<string, DragLane> = {}
const laneViews: Record<string, DragLaneView> = {}

export const dragStateFn = {
  /* -------------------------
       Metadata / getters
  -------------------------- */
  getSize(id: string): number {
    return dragState[id]?.size ?? 0
  },

  getConstraints(id: string) {
    const lane = dragState[id]
    return {
      minX: lane?.minX ?? 0,
      minY: lane?.minY ?? 0,
      maxX: lane?.maxX ?? 0,
      maxY: lane?.maxY ?? 0
    }
  },

  getPosition(id: string): Vec2 {
    return dragState[id]?.position ?? { ...ZERO_POINT }
  },

  get(id: string): DragLaneView {
    const lane = this.ensure(id)

    if (!laneViews[id]) {
      laneViews[id] = {
        position: { ...lane.position },
        offset: { ...lane.offset },
        dragging: lane.dragging
      }
    }

    return laneViews[id]
  },

  /* -------------------------
       Ensure lane exists
  -------------------------- */
  ensure(id: string): DragLane {
    if (!dragState[id]) {
      dragState[id] = {
        position: { ...ZERO_POINT },
        offset: { ...ZERO_POINT },
        size: 0,
        dragging: false
      }
    }
    return dragState[id]
  },

  /* -------------------------
       Configuration / setters
  -------------------------- */
  setSize(id: string, size: number) {
    this.ensure(id).size = size ?? 0
  },

  setConstraints(id: string, packet: { minX?: number; minY?: number; maxX?: number; maxY?: number }) {
    const lane = this.ensure(id)
    lane.minX = packet.minX
    lane.minY = packet.minY
    lane.maxX = packet.maxX
    lane.maxY = packet.maxY
  },

  setPosition(id: string, pos: Vec2) {
    const lane = this.ensure(id)
    lane.position = { x: pos.x ?? 0, y: pos.y ?? 0 }
  },

  /* -------------------------
       Dispatcher / mutations
  -------------------------- */
  swipeStart(desc: Descriptor) {
    const lane = this.ensure(desc.id)
    lane.dragging = true
    lane.offset = { ...ZERO_POINT }
  },

  swipe(desc: Descriptor) {
    const lane = this.ensure(desc.id)
    lane.offset = desc.delta as Vec2
  },

  swipeCommit(desc: Descriptor) {
    const lane = this.ensure(desc.id)
    lane.position = {
      x: (desc.delta as Vec2).x,
      y: (desc.delta as Vec2).y
    }
    lane.offset = { ...ZERO_POINT }
    lane.dragging = false
  }
}