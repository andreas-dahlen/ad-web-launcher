import { reactive, computed, readonly, nextTick } from 'vue'
// import { clampNumber } from '../state/sizeState'
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
  getSize(id) {
    return carouselState.lanes[id]?.size ?? 0
  },

  getCurrentIndex(id) {
    return carouselState.lanes[id]?.index ?? 0
  },

  get(id) {
    const lane = this.ensure(id)

    if (!laneViews[id]) {
      laneViews[id] = readonly({
        offset: computed(() => lane.offset),
        index: computed(() => lane.index),
        dragging: computed(() => lane.dragging),
        settling: computed(() => lane.settling),
        size: computed(() => lane.size),
        count: computed(() => lane.count),
        // progress: computed(() =>
        //   lane.size ? lane.offset / lane.size : 0
        // )
      })
    }
    return laneViews[id]
  },

  ensure(id) {
    if (!carouselState.lanes[id]) {
      carouselState.lanes[id] = {
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
    return carouselState.lanes[id]
  },


  /* -------------------------------------------------
     Configuration (called by layout / renderer)
     ------------------------------------------------- */

  setCount(id, count) {
    const lane = this.ensure(id)
    lane.count = Math.max(0, count)
    //might need to import vector.clamp to watch lane size dynamically..?
    // lane.index = clampNumber(lane.index, 0, lane.count - 1)
  },

  setSize(id, size) {
    this.ensure(id).size = size
  },

  /**
   * Finalize transition after CSS animation completes.
   * Called by renderer when transitionend fires.
   */
  setPosition(id) {
    const lane = this.ensure(id)
    if (!lane || !lane.pendingDir) return false

    // Suppress CSS transitions while index/offset snap to new resting state.
    // Without this, the wrapping scene would animate through the viewport.
    lane.settling = true
    lane.index = this.getNextIndex(lane.index, lane.pendingDir, lane.count)
    lane.offset = 0
    lane.pendingDir = null
    nextTick(() => { lane.settling = false })
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
    const lane = this.ensure(desc.id)
    lane.dragging = true
    if(lane.pendingDir !== null) this.setPosition(desc.id)
    lane.pendingDir = null
  },
  /**
   * Apply offset during drag - called by dispatcher on carousel:offset
   */
  swipe(desc) {
    this.ensure(desc.id).offset = desc.delta
  },
  /**
   * Commit swipe animation - called by dispatcher on carousel:commit
   */
  swipeCommit(desc) {
    const { direction, delta, id } = desc
    const lane = this.ensure(id)
        console.log('size: ', this.getSize(desc.id), 'idex: ', this.getCurrentIndex(desc.id))
    lane.pendingDir = direction
    lane.offset = delta
    lane.dragging = false
  },
  /**
   * Revert to original position - called by dispatcher on carousel:revert
   */
  swipeRevert(desc) {
    const lane = this.ensure(desc.id)
    lane.offset = 0
    lane.dragging = false
    lane.pendingDir = null
  }
}












