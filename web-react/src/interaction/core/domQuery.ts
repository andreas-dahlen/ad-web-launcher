import type { Axis, Vec2 } from '@interaction/types/primitiveType'
import { utils } from '@interaction/core/intentUtils'
import { buildDesc } from '@interaction/core/buildDesc'
import type { Descriptor, SwipeableDescriptor } from '@interaction/types/descriptor/descriptor'
import { buildContext } from '@interaction/core/buildContext'

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
      const ctx = buildContext(el)
      if (!ctx || ctx.locked) return false
      return ctx.axis === inputAxis || ctx.axis === 'both'
    })
    const desc = el ? buildDesc.resolveFromElement(el, x, y, pointerId) : null
    if (desc && desc.type !== 'button') return desc
    return null
  },

  /* ============================
     DOM offset Resolution
  =============================== */

  resolveElOffsetInDom(x: number, y: number, element: Element): Vec2 {
    //static start poisition inside of element at x, y
    const rect = element.getBoundingClientRect()
    const left = (x - rect.left)
    const top = (y - rect.top)
    const startOffset = utils.normalizedDelta({ x: left, y: top })
    return {
      ...startOffset
    }
  }
}


