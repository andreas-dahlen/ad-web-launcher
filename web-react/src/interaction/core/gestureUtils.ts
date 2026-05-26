import { APP_CONFIG } from '@config/appConfig.ts'
import { normalizeParameter, sizeStore } from '../../stores/sizeStore.ts'
import type { InteractionType, Vec2 } from '../../typeScript/core/primitiveType.ts'
import type { Axis } from '../../typeScript/core/primitiveType.ts'
import type { Descriptor, SwipeableDescriptor } from '../../typeScript/descriptor/descriptor.ts'
import type { FrameSnapshot } from '@typeScript/descriptor/baseType.ts'

export const gestureUtils = {

	normalizeFrame(rect: DOMRect): FrameSnapshot {
		return {
			left: normalizeParameter(rect.left), //needs to be subtracted with debug frame rect if ever used!
			top: normalizeParameter(rect.top), //works
			width: normalizeParameter(rect.width),
			height: normalizeParameter(rect.height), //in current system these shouldn´t be normalized!? never used though... width and height...
		}
	},

	normalizeVec2(delta: Vec2): Vec2 {
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

		const ratio = APP_CONFIG.swipeThresholdRatio ?? 0.05
		const device = sizeStore.getState().device
		const screenSize = Math.min(
			device.width,
			device.height
		)

		return distance >= screenSize * ratio
	},

	/* =========================
	Descriptor utils
	========================= */

	isSwipeableDescriptor(desc: Descriptor, intentAxis: Axis): desc is SwipeableDescriptor {
		if (desc.type == 'button') return false
		const swipeable = desc.capabilities.swipeable
		if (!swipeable) return false
		if (desc.type == 'slider' || desc.type == 'scroll') return true
		const axis = this.resolveAxis(intentAxis, desc)
		return !!axis
	}
}
