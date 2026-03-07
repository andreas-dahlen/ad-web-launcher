import { reactive } from 'vue'
import { computed } from 'vue'
import { readonly } from 'vue'
/**
 * dragState.js - Drag state management
 *
 * Mirrors slider/carousel structure for 2D drags.
 * Stores committed position plus live offset provided by the solver.
 */

const ZERO_POINT = { x: 0, y: 0 }

const dragState = reactive({
  lanes: {}
})

const laneViews = {}

export const dragStateFn = {
  getSize(id) {
    return dragState.lanes[id]?.size ?? 0
  },

  getConstraints(id) {
    const lane = dragState.lanes[id]
    return {
      minX: lane.minX ?? 0,
      minY: lane.minY ?? 0,
      maxX: lane.maxX ?? 0,
      maxY: lane.maxY ?? 0
    }
  },

  getPosition(id) {
    return dragState.lanes[id]?.position ?? { x: 0, y: 0 }
  },

get(id) {
  const lane = this.ensure(id)

  if (!laneViews[id]) {
    laneViews[id] = readonly({
      position: computed(() => lane.position),
      offset: computed(() => lane.offset),
      dragging: computed(() => lane.dragging),
    })
  }
  return laneViews[id]
},

  ensure(id) {
    if (!dragState.lanes[id]) {
      dragState.lanes[id] = {
        position: { ...ZERO_POINT },
        offset: { ...ZERO_POINT },
        size: 0,
        dragging: false
      }
    }
    return dragState.lanes[id]
  },
  setSize(id, size) {
    const lane = this.ensure(id)
    lane.size = size ?? 0
  },

  setConstraints(id, packet) {
    const drag = this.ensure(id)
    const { minX, minY, maxX, maxY } = packet
    drag.minX = minX
    drag.minY = minY
    drag.maxX = maxX
    drag.maxY = maxY
  },

  setPosition(id, pos) {
    const lane = this.ensure(id)
    lane.position = { x: pos.x ?? 0, y: pos.y ?? 0 }
  },

  /**
   * Start dragging - called by dispatcher on drag:swipeStart
   */
  swipeStart(desc) {
    const lane = this.ensure(desc.id)
    lane.dragging = true
    lane.offset = { ...ZERO_POINT }
  },

  /**
   * Apply live offset during drag - called by dispatcher on drag:swipe
   */
  swipe(desc) {
    const lane = this.ensure(desc.id)
    lane.offset = desc.delta
  },

  /**
   * Commit drag to new position - called by dispatcher on drag:swipeCommit
   */
  swipeCommit(desc) {
    const lane = this.ensure(desc.id)
    lane.position = {
      x: desc.delta.x,
      y: desc.delta.y
    }
    lane.offset = { ...ZERO_POINT }
    lane.dragging = false
  }
}