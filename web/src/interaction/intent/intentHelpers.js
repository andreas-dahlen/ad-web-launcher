import { domRegistry } from "../dom/domRegistry"
import { normalizeSwipeDelta } from '../state/sizeState'

//gesturePolicy.js
export const policy = {

  resolveSupports(type, target) {
    return !!target?.reactions?.[type]
  },

  resolveDelta(delta, axis, swipeType) {
    if (!delta) return delta
    if (swipeType === 'drag') {
      return delta // keep {x,y}
    }
    if (swipeType === 'carousel' || swipeType === 'slider') {
      if (axis === 'horizontal') return delta.x
      if (axis === 'vertical') return delta.y
    }
    return delta
  },

  normalizedDelta(delta) {
    if (!delta) return 0

    if (typeof delta === 'object') {
      return {
        x: 'x' in delta ? normalizeSwipeDelta(delta.x) : 0,
        y: 'y' in delta ? normalizeSwipeDelta(delta.y) : 0
      }
    }

    if (typeof delta === 'number') return normalizeSwipeDelta(delta)

    // anything else → force 0
    return 0
  },

  /**
   * Returns: 'horizontal' | 'vertical' | 'both' | null
   */
  resolveAxis(intentAxis, target) {
    if (!target?.axis) return null
    // Target accepts both → use intent axis
    if (target.axis === 'both') {
      return intentAxis
    }
    // Target is strict → must match intent
    if (target.axis === intentAxis) {
      return intentAxis
    }
    // Axis not supported
    return null
  },

  resolveTarget(intent) {
    const target = domRegistry.findElementAt(intent.delta.x, intent.delta.y)
    if (target && this.resolveSupports(intent.type, target)) {
      return target
    }
    return null
  },

  resolveSwipeTarget(intent, facts) {
    // Priority: target must support swipeStart AND the intent axis
    if (facts.target) {
      const axis = this.resolveAxis(intent.axis, facts.target)
      if (this.resolveSupports('swipeStart', facts.target) && axis) {
        return {
          target: facts.target,
          axis: axis,
          swipeType: facts.swipeType,
          pressCancel: false
        }
      }
    }

    // Fallback: find lane by axis
    const newTarget = domRegistry.findLaneByAxis(intent.delta.x, intent.delta.y, intent.axis)
    if (newTarget) {
      return {
        target: newTarget,
        axis: newTarget.axis, // might still be 'both'
        swipeType: newTarget.swipeType,
        pressCancel: this.resolveSupports('pressCancel', facts.target)
      }
    }
    return null
  }
}


