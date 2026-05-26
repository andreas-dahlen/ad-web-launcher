import { normalizeBase } from '../../solvers/solverUtils/axisUtils.ts'
import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { Normalized1D } from '../../../typeScript/descriptor/ctxType.ts'
import type { ScrollDesc } from '../../../typeScript/descriptor/descriptor.ts'
import type { Axis } from '@typeScript/core/primitiveType.ts'
import { APP_CONFIG } from '@config/appConfig.ts'

export const scrollUtils = {

  normalize(desc: ScrollDesc): Normalized1D {
    const { axis } = desc.base
    if (axis === 'both') return {}
    const base = normalizeBase(desc.base, desc.ctx.delta)
    return { mainDelta: base.mainDelta }
  },

  resolveMode(norm: Normalized1D, desc: ScrollDesc) {
    const { mainDelta } = norm
    if (mainDelta == null) return {}
    const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
    const raw = desc.data.settledValue - mainDelta

    console.log('overflow is reached if settled is 0: ', desc.data.settledValue === 0, 'if raw is < 0 raw:', raw, 'and desc.data.onEdgeDir exists: ', desc.data.onEdgeDir)

    if (desc.data.settledValue === 0 && raw < 0 && desc.data.onEdgeDir) {
      console.log('overflow mode!')
      return { value: { overflowValue: 0 }, isOverflow: true }  // switch to overflow mode, reset overflow
    }
    console.log('normal mode!')
    return { value: { delta1D: vector.clamp(raw, 0, maxScroll) }, isOverflow: false }
  },

  resolveScroll(norm: Normalized1D, desc: ScrollDesc) {
    const { mainDelta } = norm
    if (mainDelta == null) return
    const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
    return { delta1D: vector.clamp(desc.data.settledValue - mainDelta, 0, maxScroll) }
  },

  resolveScrollOverflow(norm: Normalized1D, desc: ScrollDesc) {
    const { mainDelta } = norm
    if (mainDelta == null) return {}
    // const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
    const raw = desc.data.settledValue - mainDelta

    return { overflowValue: raw }
  },

  resolveScrollOverflowEnd(norm: Normalized1D, desc: ScrollDesc) {
    const { mainDelta } = norm
    if (mainDelta == null) return { overflowValue: 0, event: 'swipeRevert' as const }

    const overflowValue = -(desc.data.settledValue - mainDelta)  // same as resolveScrollOverflow
    const containerSize = desc.data.containerSize.height

    if (this.shouldCommit(overflowValue, containerSize, desc.base.axis)) {
      console.log('commit')
      return { overflowValue, event: 'swipeCommit' as const }
    }
    console.log('revert')
    return { overflowValue: 0, event: 'swipeRevert' as const }
  },

  // getCommitOffset(direction: OnEdge, laneSize: number) {
  //   if (laneSize == null) return 0

  //   if (direction.dir === 'right' || direction.dir === 'down') return laneSize
  //   if (direction.dir === 'left' || direction.dir === 'up') return -laneSize
  //   return 0
  // },

  shouldCommit(delta: number, laneSize: number, axis: Axis) {
    if (laneSize == null) return false
    const axisBias = axis === 'vertical' ? 0.65 : 1
    const threshold = laneSize * APP_CONFIG.swipeCommitRatio * axisBias
    return Math.abs(delta) >= threshold
  }

}