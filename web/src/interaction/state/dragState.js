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

  setBounds(laneId, packet) {
    const drag = this.ensure(laneId)
    const {minX, minY, maxX, maxY } = packet
    drag.minX = minX
    drag.minY = minY
    drag.maxX = maxX
    drag.maxY = maxY
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
    const delta = desc.delta

    lane.position = {
      x: lane.position.x + delta.x,
      y: lane.position.y + delta.y
    }
    lane.offset = { ...ZERO_POINT }
    lane.dragging = false
  }
}