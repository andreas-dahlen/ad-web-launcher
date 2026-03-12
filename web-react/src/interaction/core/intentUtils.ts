import { normalizeParameter, getAxisSize } from '../state/sizeState'
import { APP_SETTINGS } from '../../app/config/appSettings'
import { targetResolver } from "./targetResolver"

export const utils = {
    //intentUtils.js

    resolveSupports(type, target) {
        return !!target?.reactions?.[type]
    },

    normalizedDelta(delta) {
        if (!delta) return 0
        return {
            x: 'x' in delta ? normalizeParameter(delta.x) : 0,
            y: 'y' in delta ? normalizeParameter(delta.y) : 0
        }
    },

    /**
     * Returns: 'horizontal' | 'vertical' | 'both' | null
     */
    resolveAxis(intentAxis, target) {
        if (!target?.axis) return null
        if (target.drag?.locked) return null
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
    swipeThresholdCalc(distance, desc) {
        if (desc?.type === 'slider') return true

        //there is room for adding type specific API for threshold adjustments.
        //could store different API thresholds in APP_SETTINGS for dif types.

        const ratio = APP_SETTINGS.swipeThresholdRatio ?? 0.05

        const screenSize = Math.min(
            getAxisSize('horizontal'),
            getAxisSize('vertical')
        )

        return distance >= screenSize * ratio
    },

    resolveTarget(x, y) {
        const target = targetResolver.resolveFromPoint(x, y)
        const offset = this.resolveStartOffset(x, y, target.element)
        return {desc: target, offset}
    },

    resolveSwipeTarget(x, y, intentAxis, target) { //TODO: rename function to resolveSwipeStart?
        // Priority: target must support swipeStart AND the intent axis
        if (target) {
            const axis = this.resolveAxis(intentAxis, target)
            const canSwipe = this.resolveSupports('swipeable', target) && axis
            if(canSwipe && !target.drag?.locked) {
                return {
                    desc: target,
                    pressCancel: false,
                }
            }
        }

        // Fallback: find lane by axis
        const newTarget = targetResolver.resolveLaneByAxis(x, y, intentAxis)
        if (newTarget) {
            const offset = this.resolveStartOffset(x, y, newTarget.element)
            return {
                desc: newTarget,
                pressCancel: this.resolveSupports('pressable', target),
                offset
            }
        }
        return null
    },

    resolveStartOffset(x, y, element) {
        //static start poisition inside of element at x, y
        const rect = element.getBoundingClientRect()
        const left = (x - rect.left)
        const top = (y - rect.top)
        return {
            x: normalizeParameter(left),
            y: normalizeParameter(top)
        }
    }
}

