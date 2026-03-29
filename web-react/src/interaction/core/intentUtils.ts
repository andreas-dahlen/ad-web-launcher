import { normalizeParameter, getAxisSize } from '../zunstand/sizeState.ts'
import { APP_SETTINGS } from '@config/appSettings.ts'
import { targetResolver } from "./targetResolver.ts"
import type { Reactions } from '@interaction/types/base.ts'
import type { Descriptor } from '@interaction/types/descriptor.ts'
import type { Vec2 } from '@interaction/types/primitives.ts'
import type { Axis } from '@interaction/types/primitives.ts'

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
    resolveAxis(intentAxis: Axis, target: Descriptor): Axis | null {
        if (target.type == 'button') return null
        if (target.type == 'drag' && target.data.locked) return null
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
        if (desc.type === 'slider') return true

        //there is room for adding type specific API for threshold adjustments.
        //could store different API thresholds in APP_SETTINGS for dif types.

        const ratio = APP_SETTINGS.swipeThresholdRatio ?? 0.05

        const screenSize = Math.min(
            getAxisSize('horizontal'),
            getAxisSize('vertical')
        )

        return distance >= screenSize * ratio
    },

    resolveTarget(x: number, y: number, pointerId: number): { desc: Descriptor; } | null {
        const target = targetResolver.findTargetInDom(x, y, pointerId)
        if (target) {
            return { desc: target }
        }
        return null
    },

    resolveSwipeTarget(x: number, y: number, intentAxis: Axis, target: Descriptor): { desc: Descriptor; pressCancel: boolean } | null { //TODO: rename function to resolveSwipeStart?
        // Priority: target must support swipeStart AND the intent axis
        const axis = this.resolveAxis(intentAxis, target)
        const canSwipe = this.resolveSupports('swipeable', target)
        const isLocked = target.type == 'drag' && target.data.locked
        if (canSwipe && !isLocked && axis) {
            return {
                desc: target,
                pressCancel: false,
            }
        }

        // Fallback: find lane by axis
        const newTarget = targetResolver.findLaneInDom(x, y, intentAxis, target.base.pointerId)
        if (newTarget) {
            return {
                desc: newTarget,
                pressCancel: this.resolveSupports('pressable', target),
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

