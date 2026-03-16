import { createStore } from './stateReactAdapter.ts'
import type { Descriptor, Vec2 } from '../../types/gestures.ts'

/* -------------------------------
   Types for drag state
--------------------------------- */
interface DragLane {
  position: Vec2      // committed position
  offset: Vec2        // live offset during drag
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

interface DragState {
  lanes: Record<string, DragLane>
  views: Record<string, DragLaneView>
}

/* -------------------------------
   Initial store
--------------------------------- */
const ZERO_POINT: Vec2 = { x: 0, y: 0 }

export const useDragState = createStore<DragState>({
  lanes: {},
  views: {}
})

/* -------------------------------
   Drag state functions
--------------------------------- */
export const dragStateFn = {
  /* -------------------------
       Ensure lane exists
  -------------------------- */
  ensure(id: string, s: DragState): DragLane {
    let lane = s.lanes[id]
    if (!lane) {
      lane = {
        position: { ...ZERO_POINT },
        offset: { ...ZERO_POINT },
        dragging: false
      }
      s.lanes[id] = lane
    }
    return lane
  },

  /* -------------------------
       Metadata / getters
  -------------------------- */
  // getSize(id: string): number {
  //   return useDragState.getSnapshot().lanes[id]?.size ?? 0
  // },

  getConstraints(id: string) {
    const s = useDragState.getSnapshot()
    const lane = s.lanes[id]
    return {
      minX: lane?.minX ?? 0,
      minY: lane?.minY ?? 0,
      maxX: lane?.maxX ?? 0,
      maxY: lane?.maxY ?? 0
    }
  },

  getPosition(id: string): Vec2 {
    return useDragState.getSnapshot().lanes[id]?.position ?? { ...ZERO_POINT }
  },

  get(id: string): DragLaneView {
    const s = useDragState.getSnapshot()
    const lane = this.ensure(id, s)
    if (!s.views[id]) {
      s.views[id] = {
        position: { ...lane.position },
        offset: { ...lane.offset },
        dragging: lane.dragging
      }
    }
    return s.views[id]
  },

  /* -------------------------
       Setters / configuration
  -------------------------- */
  // setSize(id: string, size: number) {
  //   useDragState.setState((s) => {
  //     this.ensure(id, s).size = size ?? 0
  //   })
  // },

  setConstraints( id: string, packet: { minX?: number; minY?: number; maxX?: number; maxY?: number }
  ) {
    useDragState.setState((s) => {
      const lane = this.ensure(id, s)
      lane.minX = packet.minX
      lane.minY = packet.minY
      lane.maxX = packet.maxX
      lane.maxY = packet.maxY
    })
  },

  setPosition(id: string, pos: Vec2) {
    useDragState.setState((s) => {
      const lane = this.ensure(id, s)
      lane.position = { x: pos.x ?? 0, y: pos.y ?? 0 }
    })
  },

  /* -------------------------
       Dispatcher / mutations
  -------------------------- */
  swipeStart(desc: Descriptor) {
    useDragState.setState((s) => {
      const lane = this.ensure(desc.base.id, s)
      lane.dragging = true
      lane.offset = { ...ZERO_POINT }
    })
  },

  swipe(desc: Descriptor) {
    useDragState.setState((s) => {
      const lane = this.ensure(desc.base.id, s)
      lane.offset = desc.runtime.delta
    })
  },

  swipeCommit(desc: Descriptor) {
    useDragState.setState((s) => {
      const lane = this.ensure(desc.base.id, s)
      lane.position = desc.runtime.delta
      lane.offset = { ...ZERO_POINT }
      lane.dragging = false
    })
  }
}