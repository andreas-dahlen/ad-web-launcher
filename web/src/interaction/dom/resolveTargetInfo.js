import { state } from '../state/stateManager'

export const targetResolver = {

  resolveFromElement(el) {
    if (!el) return null

    const ds = el.dataset || {}

    const laneId = ds.lane || null
    const axis = ds.axis || null
    const swipeType = ds.swipeType || null
    const actionId = ds.action || null

    const laneValid = laneId && axis && swipeType

    const reactions = this.buildReactions(ds, laneValid)

    return {
      element: el,
      laneId: laneValid ? laneId : null,
      axis: laneValid ? axis : null,
      swipeType: laneValid ? swipeType : null,
      actionId,

      laneSize: laneValid ? state.getSize(swipeType, laneId) : null,
      position: laneValid ? state.getPosition(swipeType, laneId) : null,
      constraints: laneValid ? state.getConstraints(swipeType, laneId) : null,

      reactions
    }
  },

  resolveFromPoint(x, y) {
    const elements = document.elementsFromPoint(x, y)

    for (const el of elements) {
      const ds = el.dataset || {}

      const laneValid = ds.lane && ds.axis && ds.swipeType
      const reactions = this.buildReactions(ds, laneValid)

      const isEligible = Object.values(reactions).some(Boolean)

      if (isEligible) {
        return this.resolveFromElement(el)
      }
    }

    return null
  },

  resolveLaneByAxis(x, y, inputAxis) {
    const el = document.elementsFromPoint(x, y).find(el => {
      const ds = el.dataset
      return ds?.lane && ds?.axis && (ds.axis === inputAxis || ds.axis === 'both')
    })

    return el ? this.resolveFromElement(el) : null
  },

  buildReactions(ds, laneValid) {
    const pressable = !!(ds.press !== undefined || ds.reactPress !== undefined || ds.action !== undefined)

    const swipeable = !!(
      ds.swipe !== undefined ||
      ds.reactSwipe !== undefined ||
      ds.reactSwipeStart !== undefined ||
      (laneValid)
    )

    const selectable = !!(ds.reactSelected !== undefined || pressable || swipeable)

    return {
      press: pressable,
      pressRelease: pressable,
      pressCancel: pressable || swipeable,
      swipeStart: swipeable,
      swipe: swipeable,
      swipeCommit: swipeable,
      swipeRevert: swipeable,
      select: selectable,
      deselect: selectable
    }
  }
}