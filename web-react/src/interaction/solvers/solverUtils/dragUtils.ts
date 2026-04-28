import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { DragDesc } from '../../../typeScript/descriptor/descriptor.ts'
import type { Vec2 } from '../../../typeScript/core/primitiveType.ts'

export const dragUtils = {

  resolveSwipe(desc: DragDesc) {
    const delta = desc.ctx.delta
    const dragPosition = desc.data.position
    const dragConstraints = desc.data.layout.constraints
    const clamped =
      vector.relativeClamp2D(delta, dragPosition, dragConstraints)
    const dx = clamped.x
    const dy = clamped.y
    return { x: dx, y: dy }
  },

  resolveCommit(desc: DragDesc) {
    const delta = desc.ctx.delta
    return vector.clamp2D(delta, desc.data.position, desc.data.layout.constraints)
  },

  resolveSnapAdjustment(desc: DragDesc, value: Vec2) {
    if (!desc.data?.snap) return null
    const { x: snapX, y: snapY } = desc.data.snap


    /**  OLD */

    // const dragConstraints = desc.data.layout.constraints

    // const snapAxis = (v: number, count: number, min: number, max: number) => {
    //   if (!count || count <= 0) return v
    //   const range = max - min
    //   if (count === 1) { return min + range / 2 }
    //   // Divide range into equal segments
    //   const step = range / (count - 1)
    //   // Translate to 0-based range before snapping
    //   const relative = v - min
    //   const snapped = Math.round(relative / step) * step
    //   return min + snapped
    // }

    // return {
    //   x: snapAxis(value.x, snapX, dragConstraints.minX, dragConstraints.maxX),
    //   y: snapAxis(value.y, snapY, dragConstraints.minY, dragConstraints.maxY)
    // }


    /** NEW */

    const { container, item, constraints } = desc.data.layout


    const snapAxis = (value: number, count: number, containerSize: number, itemSize: number, min: number, max: number) => {
      if (!count || count <= 0) return value
      if (count === 1) return vector.clamp(containerSize / 2 - itemSize / 2, min, max)
      const gridPositions = Array.from({ length: count }, (_, i) =>
        (i * containerSize / (count - 1)) - itemSize / 2
      )
      // find nearest grid position to current value
      return vector.clamp(
        gridPositions.reduce((a, b) => Math.abs(b - value) < Math.abs(a - value) ? b : a),
        min, max
      )
    }
    return {
      x: snapAxis(value.x, snapX, container.x, item.x, constraints.minX, constraints.maxX),
      y: snapAxis(value.y, snapY, container.y, item.y, constraints.minY, constraints.maxY)
    }
  }
}