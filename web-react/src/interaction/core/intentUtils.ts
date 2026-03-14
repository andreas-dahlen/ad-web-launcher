import { normalizeParameter, getAxisSize } from '../state/sizeState.ts'
import { APP_SETTINGS } from '../../app/config/appSettings.ts'
import { targetResolver } from "./targetResolver.ts"

import type { Descriptor, Axis, Reactions, Vec2 } from '../../types/gestures.ts' // adjust path if needed

export const utils = {
    //intentUtils.js

    resolveSupports(type: keyof Reactions, target?: Descriptor): boolean {
        return !!target?.reactions?.[type]
    },

    normalizedDelta(delta: Vec2): Vec2 {
        return {
            x: normalizeParameter(delta.x),
            y: normalizeParameter(delta.y)
        }
    },

    /**
     * Returns: 'horizontal' | 'vertical' | 'both' | null
     */
    resolveAxis(intentAxis: Axis, target?: Descriptor): Axis | null {
        if (!target?.base.axis) return null
        if (target.data?.locked) return null
        // Target accepts both → use intent axis
        if (target.base.axis === 'both') {
            return 'both'
        }
        // Target is strict → must match intent
        if (target.base.axis === intentAxis) {
            return intentAxis
        }
        // Axis not supported
        return null
    },

    swipeThresholdCalc(distance: number, desc: Descriptor): boolean {
        if (desc?.base.type === 'slider') return true

        //there is room for adding type specific API for threshold adjustments.
        //could store different API thresholds in APP_SETTINGS for dif types.

        const ratio = APP_SETTINGS.swipeThresholdRatio ?? 0.05

        const screenSize = Math.min(
            getAxisSize('horizontal'),
            getAxisSize('vertical')
        )

        return distance >= screenSize * ratio
    },

    resolveTarget(x: number, y: number): {desc: Descriptor; offset: Vec2 } | null {
        const target = targetResolver.resolveFromPoint(x, y)
        if (target) {
            const offset = this.resolveStartOffset(x, y, target.base.element)
            return { desc: target, offset }
        }
        return null
    },

    resolveSwipeTarget(x: number, y: number, intentAxis: Axis, target: Descriptor): {desc: Descriptor; pressCancel: boolean; offset: Vec2} | null { //TODO: rename function to resolveSwipeStart?
        // Priority: target must support swipeStart AND the intent axis
        if (target) {
            const axis = this.resolveAxis(intentAxis, target)
            const canSwipe = this.resolveSupports('swipeable', target) && axis
            const offset = this.resolveStartOffset(x, y, target.base.element)
            if (canSwipe && !target.data.locked) {
                return {
                    desc: target,
                    pressCancel: false,
                    offset: offset
                }
            }
        }

        // Fallback: find lane by axis
        const newTarget = targetResolver.resolveLaneByAxis(x, y, intentAxis)
        if (newTarget) {
            const offset = this.resolveStartOffset(x, y, newTarget.base.element)
            return {
                desc: newTarget,
                pressCancel: this.resolveSupports('pressable', target),
                offset: offset
            }
        }
        return null
    },

    resolveStartOffset(x: number, y: number, element: Element): Vec2 {
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

