
import { APP_CONFIG } from '@config/appConfig.ts'
import { vector } from "./vectorUtils.ts"
import type { Vec2, Direction } from '../../../shared/typing/core.types.ts'
import type { Normalized1D } from '../../types/ctx.types.ts'
import type { BaseWithSwipe } from '../../types/base.types.ts'

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

export function getCommitOffset(direction: Direction, laneSize: number) {
    if (laneSize == null) return 0

    if (direction.dir === 'right' || direction.dir === 'down') return laneSize
    if (direction.dir === 'left' || direction.dir === 'up') return -laneSize
    return 0
}