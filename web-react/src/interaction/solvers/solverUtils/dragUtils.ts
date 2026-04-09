import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { DragDesc } from '../../types/descriptor/descriptor.ts'
import type { Vec2 } from '../../types/primitiveType.ts'

export const dragUtils = {

  resolveSwipe(desc: DragDesc) {
    const delta = desc.ctx.delta
    const dragPosition = desc.data.position
    const dragConstraints = desc.data.constraints
    const clamped =
      vector.relativeClamp2D(delta, dragPosition, dragConstraints)
    const dx = clamped.x
    const dy = clamped.y
    return { x: dx, y: dy }
  },

  resolveCommit(desc: DragDesc) {
    const delta = desc.ctx.delta
    return vector.clamp2D(delta, desc.data.position, desc.data.constraints)
  },

  resolveSnapAdjustment(desc: DragDesc, value: Vec2) {
    if (!desc.data?.snap) return null
    const { x: snapX, y: snapY } = desc.data.snap
    const dragConstraints = desc.data.constraints

    const snapAxis = (v: number, count: number, min: number, max: number) => {
      if (!count || count <= 0) return v
      const range = max - min
      if (count === 1) { return min + range / 2 }
      // Divide range into equal segments
      const step = range / (count - 1)
      // Translate to 0-based range before snapping
      const relative = v - min
      const snapped = Math.round(relative / step) * step
      return min + snapped
    }
    return {
      x: snapAxis(value.x, snapX, dragConstraints.minX, dragConstraints.maxX),
      y: snapAxis(value.y, snapY, dragConstraints.minY, dragConstraints.maxY)
    }
  }
}