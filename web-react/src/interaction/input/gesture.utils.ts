import { APP_CONFIG } from '@config/app.config.ts'
import { normalizeParameter, sizeStore } from '../../shared/stores/size.store.ts'
import type { Vec2 } from '../../shared/typing/core.types.ts'
import type { Axis } from '../../shared/typing/core.types.ts'
import type { Descriptor, SwipeableDescriptor } from '../types/descriptor.types.ts'
import type { FrameSnapshot } from '@interaction/types/base.types.ts'

export const gestureUtils = {

	normalizeFrame(rect: DOMRect): FrameSnapshot {
		return {
			left: normalizeParameter(rect.left), //needs to be subtracted with debug frame rect if ever used!
			top: normalizeParameter(rect.top), //works
			width: rect.width,
			height: rect.height, //in current system these shouldn´t be normalized!? never used though... width and height...
		}
	},

	normalizeVec2(delta: Vec2): Vec2 {
		return {
			x: normalizeParameter(delta.x),
			y: normalizeParameter(delta.y)
		}
	},
	//FUTURE possible swipeThreshold dif for every type
	swipeThresholdCalc(distance: number, instantSwipe: boolean): boolean {
		if (instantSwipe) return true

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
	isAxisSupported(intentAxis: Axis, descAxis: Axis): boolean {
		return (
			descAxis === 'both' ||
			descAxis === intentAxis
		)
	},

	asSwipeableDescriptor(desc: Descriptor, intentAxis: Axis): SwipeableDescriptor | null {
		if (desc.type == 'button') return null
		const { swipeable, instantSwipe } = desc.capabilities
		if (!swipeable) return null
		if (instantSwipe) return desc
		if (!this.isAxisSupported(intentAxis, desc.base.axis)) return null
		return desc
	}
}
