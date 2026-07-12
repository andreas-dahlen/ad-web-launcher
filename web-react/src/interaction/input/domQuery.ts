import { gestureUtils } from './gesture.utils.ts'
import { compileDescriptor } from './buildDesc.ts'
import { extractDomMeta } from './domMeta.ts'
import type { Axis } from '@typing/core.types.ts'
import type { Descriptor, SwipeableDescriptor } from '../types/descriptor/descriptor.types.ts'
import type { ElSnapshots } from '../types/descriptor/base.types.ts'

export const domQuery = {

  /* =========================
  DOM Target Resolution
  ============================ */

  findTargetInDom(x: number, y: number, pointerId: number):
    Descriptor | null {
    const elements = document.elementsFromPoint(x, y)
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) continue

      const metadata = extractDomMeta(el)
      if (!metadata) continue

      const desc = compileDescriptor(x, y, pointerId, metadata)
      if (desc) return desc
    }
    return null
  },


  findLaneInDom(x: number, y: number, inputAxis: Axis, pointerId: number):
    SwipeableDescriptor | null {
    const elements = document.elementsFromPoint(x, y)
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) continue

      const metadata = extractDomMeta(el)
      if (!metadata) continue

      if (metadata.axis !== inputAxis && metadata.axis !== 'both') continue

      const desc = compileDescriptor(x, y, pointerId, metadata)

      if (desc && desc.type !== 'button') return desc
    }
    return null
  },

  /* ============================
     DOM offset Resolution
  =============================== */
  /** static start poisition inside of FRAME at x, y. Used to calculate pointers positioning (grabOffset) aswell as returning frame position (rect)... used for teleporting and other stuff*/
  getElSnapshot(x: number, y: number, element: Element): ElSnapshots {

    const frameRef = element.closest('[data-frame]')

    if (!frameRef) {
      throw new Error('No data-frame found for interaction element')
    }

    const rect = frameRef.getBoundingClientRect()
    const frame = gestureUtils.normalizeFrame(rect)
    const left = (x - rect.left)
    const top = (y - rect.top)
    const grabOffset = gestureUtils.normalizeVec2({ x: left, y: top })
    return {
      grabOffset, frame
    }
  }
}