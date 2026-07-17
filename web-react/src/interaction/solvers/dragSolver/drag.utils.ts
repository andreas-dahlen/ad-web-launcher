import { vector } from '../utils/vector.utils.ts'
import type { DragDesc } from '../../types/descriptor/descriptor.types.ts'
import type { Vec2 } from '../../../shared/types/core.types.ts'
import type { DragData } from '@interaction/types/descriptor/data.types.ts'

export const dragUtils = {

  resolveSwipe(data: DragData, delta: Vec2) {
    const settledOffset = data.settledOffset
    const constraints = data.constraints
    const clamped =
      vector.relativeClamp2D(delta, settledOffset, constraints)
    const dx = clamped.x
    const dy = clamped.y
    return { x: dx, y: dy }
  },

  resolveCommit(data: DragData, delta: Vec2) {
    return vector.clamp2D(delta, data.settledOffset, data.constraints)
  },

  resolveSnapAdjustment(desc: DragDesc, value: Vec2) {
    if (!desc.data?.snap) return null
    const { x: snapX, y: snapY } = desc.data.snap

    const { deviceSize, itemSize, containerSize } = desc.base.layout
    const constraints = desc.data.constraints


    const snapAxis = (value: number, count: number, deviceSize: number, itemSize: number, frameOffset: number, min: number, max: number) => {
      if (!count || count <= 0) return value
      const positions = Array.from({ length: count }, (_, i) =>
        (i + 0.5) * deviceSize / count - frameOffset - itemSize / 2
      )
      return vector.clamp(
        positions.reduce((a, b) => Math.abs(b - value) < Math.abs(a - value) ? b : a),
        min, max
      )
    }

    return {
      x: snapAxis(value.x, snapX, deviceSize.width, itemSize.width, 0, constraints.minX, constraints.maxX),
      y: snapAxis(value.y, snapY, deviceSize.height, itemSize.height, containerSize.height, constraints.minY, constraints.maxY)
    }
  }
}

