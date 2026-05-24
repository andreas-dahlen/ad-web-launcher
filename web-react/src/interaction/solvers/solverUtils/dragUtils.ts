import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { DragDesc } from '../../../typeScript/descriptor/descriptor.ts'
import type { Vec2 } from '../../../typeScript/core/primitiveType.ts'

export const dragUtils = {

  resolveSwipe(desc: DragDesc) {
    const delta = desc.ctx.delta
    const settledOffset = desc.data.settledOffset
    const dragConstraints = desc.data.layout.constraints
    const clamped =
      vector.relativeClamp2D(delta, settledOffset, dragConstraints)
    const dx = clamped.x
    const dy = clamped.y
    return { x: dx, y: dy }
  },

  resolveCommit(desc: DragDesc) {
    const delta = desc.ctx.delta
    return vector.clamp2D(delta, desc.data.settledOffset, desc.data.layout.constraints)
  },

  resolveSnapAdjustment(desc: DragDesc, value: Vec2) {
    if (!desc.data?.snap) return null
    const { x: snapX, y: snapY } = desc.data.snap

    const { deviceSize, itemSize, constraints } = desc.data.layout


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
      y: snapAxis(value.y, snapY, deviceSize.height, itemSize.height, desc.base.frame.height, constraints.minY, constraints.maxY)
    }
  }
}

