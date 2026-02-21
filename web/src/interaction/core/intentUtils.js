import { normalizeSwipeDelta, getAxisSize } from '../state/sizeState'
import { APP_SETTINGS } from '../../config/appSettings'
import { targetResolver } from "./targetResolver"

export const utils = {
    //intentUtils.js

    resolveSupports(type, target) {
        return !!target?.reactions?.[type]
    },

    normalizedDelta(delta) {
        if (!delta) return 0
        return {
            x: 'x' in delta ? normalizeSwipeDelta(delta.x) : 0,
            y: 'y' in delta ? normalizeSwipeDelta(delta.y) : 0
        }
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
        const target = targetResolver.resolveFromPoint(x, y)
        return target
    },

    resolveSwipeTarget(x, y, intentAxis, target) {
        // Priority: target must support swipeStart AND the intent axis
        if (target) {
            const axis = this.resolveAxis(intentAxis, target)
            if (this.resolveSupports('swipeStart', target) && axis) {
                return {
                    targetInfo: target,
                    pressCancel: false,
                    lockedAxis: target.axis
                }
            }
        }

        // Fallback: find lane by axis
        const newTarget = targetResolver.resolveLaneByAxis(x, y, intentAxis)
        if (newTarget) {
            return {
                targetInfo: newTarget,
                pressCancel: this.resolveSupports('pressCancel', target),
            }
        }
        return null
    },
    resolveStartOffset(x, y, element) {
        //static start poisition inside of element at x, y
        const rect = element.getBoundingClientRect()
            return {
            x: x - rect.left,
            y: y - rect.top
        }
    }
}
