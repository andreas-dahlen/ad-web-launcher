import { reactive } from 'vue'
import { clampNumber } from '../state/sizeState'
import { computed } from 'vue'
import { readonly } from 'vue'
/* -------------------------------------------------
Central carousel state

This is a passive reactive store. All mutations
should flow through dispatcher actions.
------------------------------------------------- */

const carouselState = reactive({
  lanes: {}
})

const laneViews = {}

export const carouselStateFn = {
  getSize(laneId) {
    return carouselState.lanes[laneId]?.size ?? 0
  },

  getCurrentIndex(laneId) {
    return carouselState.lanes[laneId]?.index ?? 0
  },

  get(laneId) {
    const lane = this.ensure(laneId)

    if (!laneViews[laneId]) {
      laneViews[laneId] = readonly({
        offset: computed(() => lane.offset),
        index: computed(() => lane.index),
        dragging: computed(() => lane.dragging),
        size: computed(() => lane.size),
        count: computed(() => lane.count),
        progress: computed(() =>
          lane.size ? lane.offset / lane.size : 0
        )
      })
    }
    return laneViews[laneId]
  },

  ensure(laneId) {
    if (!carouselState.lanes[laneId]) {
      carouselState.lanes[laneId] = {
        index: 0,
        count: 0,
        offset: 0,
        size: 0,
        dragging: false,
        pendingDir: null,
        lockPrevAt: null,
        lockNextAt: null
      }
    }
    return carouselState.lanes[laneId]
  },


  /* -------------------------------------------------
     Configuration (called by layout / renderer)
     ------------------------------------------------- */

  setCount(laneId, count) {
    const lane = this.ensure(laneId)
    lane.count = Math.max(0, count)
    lane.index = clampNumber(lane.index, 0, lane.count - 1)
  },

  setSize(laneId, size) {
    this.ensure(laneId).size = size
  },

  /**
   * Finalize transition after CSS animation completes.
   * Called by renderer when transitionend fires.
   */
  setPosition(laneId) {
    const lane = this.ensure(laneId)
    if (!lane || !lane.pendingDir) return false

    lane.index = this.getNextIndex(lane.index, lane.pendingDir, lane.count)
    lane.offset = 0
    lane.pendingDir = null
    return true
  },

  getNextIndex(currentIndex, direction, count) {
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

  /* -------------------------------------------------
     Dispatcher Actions (single choke point for mutations)
     
     These are the only functions that should mutate
     carousel state during gesture handling.
  ------------------------------------------------- */

  /**
   * Start dragging - called by dispatcher on carousel:dragStart
   */
  swipeStart(desc) {
    const lane = this.ensure(desc.laneId)
    lane.dragging = true
    lane.pendingDir = null
  },
  /**
   * Apply offset during drag - called by dispatcher on carousel:offset
   */
  swipe(desc) {
    this.ensure(desc.laneId).offset = desc.delta
  },
  /**
   * Commit swipe animation - called by dispatcher on carousel:commit
   */
  swipeCommit(desc) {
    const { direction, delta, laneId } = desc
    const lane = this.ensure(laneId)
    lane.pendingDir = direction
    lane.offset = delta
    lane.dragging = false
  },
  /**
   * Revert to original position - called by dispatcher on carousel:revert
   */
  swipeRevert(desc) {
    const lane = this.ensure(desc.laneId)
    lane.offset = 0
    lane.dragging = false
    lane.pendingDir = null
  }
}












