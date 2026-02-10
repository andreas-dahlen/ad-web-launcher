import { reactive } from 'vue'

/**
 * dragState.js - Drag state management
 *
 * Mirrors slider/carousel structure for 2D drags.
 * Stores committed position plus live offset provided by the solver.
 */

const ZERO_POINT = { x: 0, y: 0 }

export const dragState = reactive({
  lanes: {}
})

export const dragStateFn = {
  getSize(laneId) {
    return dragState.lanes[laneId]?.size ?? 0
  },

  getConstraints(laneId) {
    const lane = dragState.lanes[laneId]
    return {
      minX: lane.minX ?? 0,
      minY: lane.minY ?? 0,
      maxX: lane.maxX ?? 0,
      maxY: lane.maxY ?? 0
    }
  },

  getPosition(laneId) {
    return dragState.lanes[laneId]?.position ?? { x: 0, y: 0 }
  },

  get(laneId) {
    return dragState.lanes[laneId] ?? null
  },

  ensure(laneId) {
    if (!dragState.lanes[laneId]) {
      dragState.lanes[laneId] = {
        position: { ...ZERO_POINT },
        offset: { ...ZERO_POINT },
        size: 0,
        dragging: false
      }
    }
    return dragState.lanes[laneId]
  },
  setSize(laneId, size) {
    const lane = this.ensure(laneId)
    lane.size = size ?? 0
  },

  setConstraints(laneId, packet) {
    const drag = this.ensure(laneId)
    const { minX, minY, maxX, maxY } = packet
    drag.minX = minX
    drag.minY = minY
    drag.maxX = maxX
    drag.maxY = maxY
  },

  setPosition(laneId, pos) {
    const lane = this.ensure(laneId)
    lane.position = { x: pos.x ?? 0, y: pos.y ?? 0 }
  },

  /**
   * Start dragging - called by dispatcher on drag:swipeStart
   */
  swipeStart(desc) {
    const lane = this.ensure(desc.laneId)
    lane.dragging = true
    lane.offset = { ...ZERO_POINT }
  },

  /**
   * Apply live offset during drag - called by dispatcher on drag:swipe
   */
  swipe(desc) {
    const lane = this.ensure(desc.laneId)
    lane.offset = desc.delta
  },

  /**
   * Commit drag to new position - called by dispatcher on drag:swipeCommit
   */
  swipeCommit(desc) {
    const lane = this.ensure(desc.laneId)

    lane.position = {
      x: desc.delta.x,
      y: desc.delta.y
    }
    lane.offset = { ...ZERO_POINT }
    lane.dragging = false
  }
}