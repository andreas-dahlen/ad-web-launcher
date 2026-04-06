import { normalizeParameter, getAxisSize } from '../stores/sizeState.ts'
import { APP_SETTINGS } from '@config/appSettings.ts'
import { domQuery } from "./domQuery.ts"
import type { Reactions } from '@interaction/types/descriptor/baseType.ts'
import type { Vec2 } from '@interaction/types/primitiveType.ts'
import type { Axis } from '@interaction/types/primitiveType.ts'
import type { Descriptor } from '@interaction/types/descriptor/descriptor.ts'
import type { CancelData } from '@interaction/types/ctxType.ts'

//intentUtils.js
export const utils = {

	resolveSupports(type: keyof Reactions, desc: Descriptor): boolean {
		return !!desc?.reactions?.[type]
	},

	normalizedDelta(delta: Vec2): Vec2 {
		return {
			x: normalizeParameter(delta.x),
			y: normalizeParameter(delta.y)
		}
	},

	/* =========================
	Utils
	========================= */
	/**
	* Returns: 'horizontal' | 'vertical' | 'both' | null
	*/
	resolveAxis(intentAxis: Axis, desc: Descriptor): Axis | null {
		if (desc.type == 'button') return null
		if (desc.type == 'drag' && desc.data.locked) return null
		// meta accepts both → use intent axis
		if (desc.base.axis === 'both') {
			return 'both'
		}
		// meta is strict → must match intent
		if (desc.base.axis === intentAxis) {
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

	/* =========================
	meta utils
	========================= */

	// resolveTarget(x: number, y: number, pointerId: number): Descriptor | null {
	// 	const resolved = domQuery.findTargetInDom(x, y, pointerId)
	// 	if (resolved) {
	// 		return resolved
	// 	}
	// 	return null
	// },

	resolveSwipeStart(x: number, y: number, intentAxis: Axis, desc: Descriptor): { desc: Descriptor; pressCancel: boolean } | null {
		// Priority: meta must support swipeStart AND the intent axis
		const axis = this.resolveAxis(intentAxis, desc)
		const canSwipe = this.resolveSupports('swipeable', desc)
		const isLocked = desc.type == 'drag' && desc.data.locked
		if (canSwipe && !isLocked && axis) {
			return {
				desc: desc,
				pressCancel: false,
			}
		}
		//added slider passthrough to handel accidental wrong axis swipe on sliders.
		if (canSwipe && !isLocked && desc.ctx.type == 'slider') {
			return {
				desc: desc,
				pressCancel: false
			}
		}

		// Fallback: find lane by axis
		const newMeta = domQuery.findLaneInDom(x, y, intentAxis, desc.base.pointerId)
		if (newMeta) {
			return {
				desc: newMeta,
				pressCancel: this.resolveSupports('pressable', desc),
			}
		}
		return null
	},

	/* =========================
	Descriptor modifiers
	========================= */

	resolveCancel(element: HTMLElement, desc: Descriptor, willCancel: boolean): Descriptor {
		if (desc.type == 'button') return desc

		const cancel: CancelData | undefined = willCancel
			? { element: element, pressCancel: true }
			: undefined
		desc.ctx.cancel = cancel
		return desc
	}
}