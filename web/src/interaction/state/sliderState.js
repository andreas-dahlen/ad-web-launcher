import { reactive } from 'vue'
import { computed } from 'vue'
import { readonly } from 'vue'
/**
 * sliderState.js - Slider state management
*
* This is exactly like carouselState, except:
* - No index/count (continuous value instead of discrete items)
* - No pendingDir (no revert behavior)
* - Tracks current value and offset during drag
*/

/* -------------------------------------------------
Central slider state

This is a passive reactive store. All mutations
should flow through dispatcher actions.
------------------------------------------------- */

const sliderState = reactive({
  sliders: {}
})
const laneViews = {}

/* -------------------------------------------------
Slider creation / access
------------------------------------------------- */

export const sliderStateFn = {
  getSize(id) {
    return sliderState.sliders[id]?.size ?? 0
  },

  getThumbSize(id) {
    return sliderState.sliders[id]?.thumbSize ?? 0
  },

  getConstraints(id) {
    return {
      min: sliderState.sliders[id]?.min ?? 0,
      max: sliderState.sliders[id]?.max ?? 100
    }
  },
  getPosition(id) {
    return sliderState.sliders[id]?.value ?? 0
  },

  get(id) {
    const lane = this.ensure(id)

    if (!laneViews[id]) {
      laneViews[id] = readonly({
        value: computed (() => lane.value),
        offset: computed(() => lane.offset),
        dragging: computed(() => lane.dragging),
      })
    }
    return laneViews[id]
  },

  ensure(id) {
    if (!sliderState.sliders[id]) {
      sliderState.sliders[id] = {
        value: 0,       // logical position (0–100 or whatever)
        offset: 0,      // optional for live dragging
        min: 0,
        max: 100,
        size: 0,
      }
    }
    return sliderState.sliders[id]
  },
  setConstraints(id, packet) {
    const slider = this.ensure(id)
    slider.min = packet.min
    slider.max = packet.max
  },
  setSize(id, size) {
    this.ensure(id).size = size
  },

  setThumbSize(id, thumbSize) {
    this.ensure(id).thumbSize = thumbSize },
  /* -------------------------------------------------
     Dispatcher Actions (single choke point for mutations)
     
     These are the only functions that should mutate
     slider state during gesture handling.
  ------------------------------------------------- */
  press(desc) {
    const slider = this.ensure(desc.id)
    slider.value = desc.delta
  },
  /**
   * Start dragging - called by dispatcher on slider:swipeStart
   */
  swipeStart(desc) {
    const slider = this.ensure(desc.id)
    slider.dragging = true
    slider.value = desc.delta
  },
  /**
   * Apply offset during drag - called by dispatcher on slider:swipe
   */
  swipe(desc) {
    const slider = this.ensure(desc.id)
    slider.value = desc.delta
  },

  /**
   * Commit slider to new value - called by dispatcher on slider:swipeCommit
   * Receives logical delta (already converted from pixels by solver)
   */

  swipeCommit(desc) {
    const slider = this.ensure(desc.id)
    slider.value = desc.delta
    slider.dragging = false
  }
}

