import type { Axis } from '../../typeScript/core/primitiveType.ts'
import { gestureUtils } from '../core/gestureUtils.ts'
import { buildDesc } from '../core/buildDesc.ts'
import type { Descriptor, SwipeableDescriptor } from '../../typeScript/descriptor/descriptor.ts'
import { extractDomMeta } from './domMeta.ts'
import type { ElSnapshots } from '@typeScript/descriptor/baseType.ts'

export const domQuery = {

  /* =========================
     DOM Target Resolution
  ============================ */

  findTargetInDom(x: number, y: number, pointerId: number): Descriptor | null {
    const elements = document.elementsFromPoint(x, y)
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) continue
      const desc = buildDesc.resolveFromElement(el, x, y, pointerId)
      if (desc) return desc
    }
    return null
  },

  findLaneInDom(x: number, y: number, inputAxis: Axis, pointerId: number): SwipeableDescriptor | null {
    const el = document.elementsFromPoint(x, y).find((
      el): el is HTMLElement => {
      if (!(el instanceof HTMLElement)) return false
      const metaData = extractDomMeta(el)
      if (!metaData || metaData.locked) return false
      return metaData.axis === inputAxis || metaData.axis === 'both'
    })
    const desc = el ? buildDesc.resolveFromElement(el, x, y, pointerId) : null
    if (desc && desc.type !== 'button') return desc
    return null
  },

  /* ============================
     DOM offset Resolution
  =============================== */
  /** static start poisition inside of FRAME at x, y. Used to calculate pointers positioning (grabOffset) aswell as returning frame position (rect)*/
  getElSnapshot(x: number, y: number, element: Element): ElSnapshots {

    const frameRef = element.closest('[data-frame]')

    if (!frameRef) {
      throw new Error('No data-frame found for interaction element')
    }

    const rect = frameRef.getBoundingClientRect()
    const left = (x - rect.left)
    const top = (y - rect.top)
    const grabOffset = gestureUtils.normalizedDelta({ x: left, y: top })
    const frame = gestureUtils.normalizeFrame(rect)
    return {
      grabOffset, frame
    }
  }
}