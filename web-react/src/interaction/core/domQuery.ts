import type { Axis, Vec2 } from '@interaction/types/primitives.ts'
import type { Reactions } from '@interaction/types/base.ts'
import { utils } from '@interaction/core/intentUtils'
import { buildMeta } from '@interaction/core/buildMeta'
import type { Descriptor } from '@interaction/types/descriptor'

export const domQuery = {

  isEligible(reactions: Reactions): boolean {
    return reactions.pressable || reactions.swipeable || reactions.modifiable
  },

  /* =========================================================
     DOM Target Resolution
  ========================================================= */

  findTargetInDom(x: number, y: number, pointerId: number): Descriptor | null {
    const elements = document.elementsFromPoint(x, y)
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) continue
      const ctx = utils.buildContext(el)
      if (!ctx) continue
      const reactions = buildMeta.buildReactions(ctx.ds, ctx.laneValid)
      const meta = buildMeta.resolveFromElement(el, x, y, pointerId)
      if (this.isEligible(reactions) && meta) {
        return meta
      }
    }
    return null
  },

  findLaneInDom(x: number, y: number, inputAxis: Axis, pointerId: number): Descriptor | null {
    const el = document.elementsFromPoint(x, y).find((
      el): el is HTMLElement => {
      if (!(el instanceof HTMLElement)) return false
      const ds = el.dataset || {}
      const locked = ds.locked === 'true' // read as boolean
      const laneValid = Boolean(ds.id && ds.axis && (ds.axis === inputAxis || ds.axis === 'both')
      )
      // skip locked lanes for swipe start
      return laneValid && !locked
    })
    return el ? buildMeta.resolveFromElement(el, x, y, pointerId) : null
  },

  /* =========================================================
     DOM offset Resolution
  ========================================================= */

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