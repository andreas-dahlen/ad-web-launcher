import { normalizeBase } from '../../solvers/solverUtils/axisUtils.ts'
import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { Normalized1D } from '../../../typeScript/descriptor/ctxType.ts'
import type { ScrollDesc } from '../../../typeScript/descriptor/descriptor.ts'
import { type Axis, type OnEdgeDir } from '@typeScript/core/primitiveType.ts'
import { APP_CONFIG } from '@config/appConfig.ts'

export const scrollUtils = {

  normalize(desc: ScrollDesc): Normalized1D {
    const { axis } = desc.base
    if (axis === 'both') return {}
    const base = normalizeBase(desc.base, desc.ctx.delta)
    return { mainDelta: base.mainDelta }
  },

  isOverflow(desc: ScrollDesc) {
    if (desc.data.isVisible == false) return true
    if (!desc.data.onEdgeDir || !desc.ctx.thresholdValue || desc.data.settledValue !== 0) return false
    return vector.isThresholdDirAndOnEdgeDir(desc.data.onEdgeDir, desc.base.axis, desc.ctx.thresholdValue)
  },

  resolveScroll(mainDelta: number, desc: ScrollDesc) {
    const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
    const raw = desc.data.settledValue - mainDelta
    return { delta1D: vector.clamp(raw, 0, maxScroll) }
  },

  resolveOverflowStart(mainDelta: number, desc: ScrollDesc) {
    if (desc.data.isVisible) {
      return { overflowValue: 0 }
    }
    // return { overflowValue: desc.data.settledValue - mainDelta }
    return { overflowValue: 0 }
  },

  resolveOverflow(mainDelta: number, desc: ScrollDesc) {
    return { overflowValue: desc.data.settledValue - mainDelta }
  },

  resolveScrollEnd(mainDelta: number, desc: ScrollDesc) {
    console.log('resolveScrollEnd')
    return { ...this.resolveScroll(mainDelta, desc), isVisible: true }
  },
  resolveOverflowEnd(mainDelta: number, desc: ScrollDesc) {
    return this.shouldCommit(mainDelta, desc.data.containerSize.height, desc.base.axis)
      ? this.overflowCommit(mainDelta, desc)
      : this.overflowRevert()
  },


  overflowCommit(mainDelta: number, desc: ScrollDesc) {
    const containerSize = desc.data.containerSize.height
    console.log('overflow commit')
    if (!desc.data.onEdgeDir) return { stateAccepted: false }
    const distance = this.getCommitOffset(desc.data.onEdgeDir, containerSize)
    if (!desc.data.isVisible) return {
      overflowValue: 0, isVisible: true
    }

    return { overflowValue: distance, isVisible: false }

  },

  overflowRevert() {
    console.log('overflow revert')
  },


  getCommitOffset(direction: OnEdgeDir, laneSize: number) {
    if (laneSize == null) return 0

    if (direction === 'right' || direction === 'down') return laneSize
    if (direction === 'left' || direction === 'up') return -laneSize
    return 0
  },

  shouldCommit(delta: number, laneSize: number, axis: Axis) {
    if (laneSize == null) return false
    const axisBias = axis === 'vertical' ? 0.65 : 1
    const threshold = laneSize * APP_CONFIG.swipeCommitRatio * axisBias
    return Math.abs(delta) >= threshold
  }

}



// resolveSwipe(norm: Normalized1D, desc: ScrollDesc) {
//   const { mainDelta } = norm
//   if (mainDelta == null) return {}

//   const raw = desc.data.settledValue - mainDelta

//   console.log('overflow is reached if settled is 0:', desc.data.settledValue === 0, 'if raw is < 0 raw:', raw, 'and desc.data.onEdgeDir exists:', desc.data.onEdgeDir !== undefined, 'OR if visible is false:', desc.data.isVisible)

//   if (!desc.data.isVisible) console.log("overflow mode!")

//   // if ((desc.data.settledValue === 0 && raw < 0 && desc.data.onEdgeDir) || !desc.data.isVisible) {
//   //   console.log('overflow mode!')
//   //   return { value: { overflowValue: 0 }, isOverflow: true }  // switch to overflow mode, reset overflow
//   // }
//   console.log('normal mode!')
//   const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
//   return { value: { delta1D: vector.clamp(raw, 0, maxScroll) }, isOverflow: false }
// },

// //scrole mode only!
// resolveScrollOld(norm: Normalized1D, desc: ScrollDesc) {
//   const { mainDelta } = norm
//   if (mainDelta == null) return
//   const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
//   return { delta1D: vector.clamp(desc.data.settledValue - mainDelta, 0, maxScroll) }
// },

// resolveScrollOverflow(norm: Normalized1D, desc: ScrollDesc) {
//   const { mainDelta } = norm
//   if (mainDelta == null) return {}
//   // const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
//   const raw = desc.data.settledValue - mainDelta

//   return { overflowValue: raw }
// },

// resolveScrollOverflowEndOld(norm: Normalized1D, desc: ScrollDesc) {
//   const { mainDelta } = norm
//   if (mainDelta == null) return { overflowValue: 0, event: 'swipeRevert' as const }

//   const overflowValue = -(desc.data.settledValue - mainDelta)  // same as resolveScrollOverflow
//   const containerSize = desc.data.containerSize.height

//   if (this.shouldCommit(overflowValue, containerSize, desc.base.axis)) {
//     console.log('overflow commit')
//     if (desc.data.onEdgeDir) {
//       const distance = this.getCommitOffset(desc.data.onEdgeDir, containerSize)
//       return { overflowValue: distance, event: 'swipeCommit' as const }
//     }
//   }
//   console.log('overflow revert')
//   return { overflowValue: 0, event: 'swipeRevert' as const }
// },


//resolveMode... overflow path... default: visible is true else visible is false...