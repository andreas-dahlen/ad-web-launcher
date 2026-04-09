import { APP_SETTINGS } from '@config/appSettings.ts'
import { normalizeParameter, getAxisSize } from '../stores/sizeStore.ts'
import type { InteractionType, Vec2 } from '../types/primitiveType.ts'
import type { Axis } from '../types/primitiveType.ts'
import type { Descriptor, SwipeableDescriptor } from '../types/descriptor/descriptor.ts'

//gestureUtils.js
export const gestureUtils = {

	normalizedDelta(delta: Vec2): Vec2 {
		return {
			x: normalizeParameter(delta.x),
			y: normalizeParameter(delta.y)
		}
	},

	resolveAxis(intentAxis: Axis, desc: Descriptor): Axis | null {
		if (desc.type == 'button') return null
		if (desc.type == 'drag' && desc.data.locked) return null
		// desc accepts both → use intent axis
		if (desc.base.axis === 'both') {
			return 'both'
		}
		// desc is strict → must match intent
		if (desc.base.axis === intentAxis) {
			return intentAxis
		}
		// Axis not supported
		return null
	},

	//FUTURE possible swipeThreshold dif for every type
	swipeThresholdCalc(distance: number, type: InteractionType): boolean {
		if (type === 'slider') return true

		const ratio = APP_SETTINGS.swipeThresholdRatio ?? 0.05

		const screenSize = Math.min(
			getAxisSize('horizontal'),
			getAxisSize('vertical')
		)

		return distance >= screenSize * ratio
	},

	/* =========================
	Descriptor utils
	========================= */

	isSwipeableDescriptor(desc: Descriptor, intentAxis: Axis): desc is SwipeableDescriptor {
		if (desc.type == 'button') return false
		const swipeable = desc.reactions.swipeable
		const isLocked = desc.type === 'drag' && desc.data.locked
		if (!swipeable || isLocked) return false
		if (desc.type == 'slider') return true
		const axis = this.resolveAxis(intentAxis, desc)
		return !!axis
	}
}