
import { APP_SETTINGS } from "@config/appSettings.ts"
import { vector } from "./vectorUtils.ts"
import type { Vec2 } from '@interaction/types/primitiveType.ts'
import type { Normalized1D } from '@interaction/types/ctxType.ts'
import type { BaseWithSwipe } from '@interaction/types/descriptor/baseType.ts'

export function normalizeBase(base: BaseWithSwipe, delta: Vec2): Normalized1D {
    const { baseOffset, axis } = base
    if (axis === 'both') return {}
    const offset = vector.resolveByAxis1D(baseOffset, axis)
    const movement = vector.resolveByAxis1D(delta, axis)
    return {
        mainOffset: offset?.prim,
        crossOffset: offset?.sub,
        mainDelta: movement?.prim,
        crossDelta: movement?.sub
    }
}

export function exceedsCrossRange(norm: Normalized1D) {
    const currentPos = (norm.crossOffset ?? 0) + (norm.crossDelta ?? 0)
    const crossSize = norm.crossSize ?? 0
    return currentPos < -APP_SETTINGS.hysteresis || currentPos > crossSize + APP_SETTINGS.hysteresis
}