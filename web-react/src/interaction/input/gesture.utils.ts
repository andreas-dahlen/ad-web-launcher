import { APP_CONFIG } from '@config/app.config.ts'
import { normalizeParameter, sizeStore } from '@stores/size.store.ts'
import type { Descriptor, SwipeableDescriptor } from '../types/descriptor/descriptor.types.ts'
import type { FrameSnapshot } from '../types/descriptor/base.types.ts'
import type { Axis, Vec2 } from '../../shared/types/core.types.ts'

export const gestureUtils = {

	normalizeFrame(rect: DOMRect): FrameSnapshot {
		return {
			left: normalizeParameter(rect.left), //needs to be subtracted with debug frame rect if ever used!
			top: normalizeParameter(rect.top), //works
			// width: normalizeParameter(rect.width),
			// height: normalizeParameter(rect.height), 
		}
	},
	// Bounding rect data used by gesture coordinate translation.
	// Width/height intentionally come from sizeStore.

	normalizeVec2(delta: Vec2): Vec2 {
		return {
			x: normalizeParameter(delta.x),
			y: normalizeParameter(delta.y)
		}
	},
	//FUTURE possible swipeThreshold dif for every type
	swipeThresholdCalc(distance: number, isInstantSwipe: boolean): boolean {
		if (isInstantSwipe) return true

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

	asSwipeableDescriptor(desc: Descriptor, intentAxis: Axis): SwipeableDescriptor | null {
		if (desc.type == 'button') return null
		const { isSwipeable, isInstantSwipe } = desc.capabilities
		if (!isSwipeable) return null
		if (isInstantSwipe) return desc
		if (!isAxisSupported(intentAxis, desc.base.axis)) return null
		return desc
	}
}

function isAxisSupported(intentAxis: Axis, descAxis: Axis): boolean {
	return (
		descAxis === 'both' ||
		descAxis === intentAxis
	)
}

export const __TEST_ONLY_API = { isAxisSupported }