
import { APP_CONFIG } from '@config/appConfig.ts'
import { vector } from "./vectorUtils.ts"
import type { Vec2 } from '../../../typeScript/core/primitiveType.ts'
import type { Normalized1D } from '../../../typeScript/descriptor/ctxType.ts'
import type { BaseWithSwipe } from '../../../typeScript/descriptor/baseType.ts'

export function normalizeBase(base: BaseWithSwipe, delta: Vec2): Normalized1D {
    const { grabOffset, axis } = base
    if (axis === 'both') return {}
    const offset = vector.resolveByAxis1D(grabOffset.x, grabOffset.y, axis)
    const movement = vector.resolveByAxis1D(delta.x, delta.y, axis)
    return {
        mainOffset: offset?.main,
        crossOffset: offset?.cross,
        mainDelta: movement?.main,
        crossDelta: movement?.cross
    }
}

export function exceedsCrossRange(norm: Normalized1D) {
    const currentPos = (norm.crossOffset ?? 0) + (norm.crossDelta ?? 0)
    const crossSize = norm.crossSize ?? 0
    return currentPos < -APP_CONFIG.hysteresis || currentPos > crossSize + APP_CONFIG.hysteresis
}