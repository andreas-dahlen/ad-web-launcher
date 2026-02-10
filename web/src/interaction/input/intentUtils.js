import { domRegistry } from "../dom/domRegistry"
import { normalizeSwipeDelta, getAxisSize } from '../state/sizeState'
import { APP_SETTINGS } from '../../config/appSettings'

export const utils = {
    //gesturePolicy.js

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
            return 'both'
        }
        // Target is strict → must match intent
        if (target.axis === intentAxis) {
            return intentAxis
        }
        // Axis not supported
        return null
    },
    swipeThresholdCalc(distance) {
        const ratio = APP_SETTINGS.swipeThresholdRatio ?? 0.05

        const screenSize = Math.min(
            getAxisSize('horizontal'),
            getAxisSize('vertical')
        )

        return distance >= screenSize * ratio
    },

    resolveTarget(x, y) {
        const target = domRegistry.findElementAt(x, y)
        if (target) return target
        return null
    },

    resolveSwipeTarget(x, y, intentAxis, target) {
        // Priority: target must support swipeStart AND the intent axis
        if (target) {
            const axis = this.resolveAxis(intentAxis, target)
            if (this.resolveSupports('swipeStart', target) && axis) {
                return {
                    target: target,
                    axis: axis,
                    // swipeType: facts.swipeType,
                    pressCancel: false
                }
            }
        }

        // Fallback: find lane by axis
        const newTarget = domRegistry.findLaneByAxis(x, y, intentAxis)
        if (newTarget) {
            return {
                target: newTarget,
                axis: newTarget.axis, // might still be 'both'
                // swipeType: newTarget.swipeType,
                pressCancel: this.resolveSupports('pressCancel', target)
            }
        }
        return null
    }
}
