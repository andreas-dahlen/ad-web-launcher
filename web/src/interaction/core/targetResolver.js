import { state } from '../state/stateManager'

export const targetResolver = {
  resolveFromElement(el) {
    if (!el) return null

    const ctx = this.buildContext(el)
    if (!ctx) return null

    return {
      ...this.buildBase(ctx),
      ...this.buildSwipe(ctx),
      ...this.buildModifiers(ctx),
      reactions: this.buildReactions(ctx.ds, ctx.laneValid)
    }
  },

  buildContext(el) {
    const ds = el.dataset || {}
    const laneId = ds.lane || null
    const axis = ds.axis || null
    const swipeType = ds.swipeType || null
    const laneValid = Boolean(laneId && axis && swipeType)
    const snapX = ds.snapX != null ? Number(ds.snapX) : null
    const snapY = ds.snapY != null ? Number(ds.snapY) : null
    return { el, ds, laneId, axis, swipeType, laneValid, snapX, snapY }
  },

  buildModifiers(ctx) {
    if (ctx.snapX == null && ctx.snapY == null) return null
    return {
      snap: { x: ctx.snapX, y: ctx.snapY }
    }
  },

  buildBase(ctx) {
    return {
      element: ctx.el,
      laneId: ctx.laneValid ? ctx.laneId : null,
      axis: ctx.laneValid ? ctx.axis : null,
      swipeType: ctx.laneValid ? ctx.swipeType : null,
      actionId: ctx.ds.action || null,
      startOffset: null,
      // snap: ctx.snapValid ? { snapX: ctx.snapX, snapY: ctx.snapY } : null
    }
  },

  buildSwipe(ctx) {
    if (!ctx.laneValid) return {}
    const { laneId, swipeType } = ctx

    return {
      //ALL
      laneSize: state.getSize(swipeType, laneId),//{x, y}
      // //SLIDER
      sliderThumbSize: swipeType === 'slider'
        ? state.getThumbSize(swipeType, laneId) : null,
      // sliderPosition: swipeType === 'slider'
      //   ? state.getPosition(swipeType, laneId) : null, //number
      sliderConstraints: swipeType === 'slider'
        ? state.getConstraints(swipeType, laneId) : null,//{min, max}
      //DRAG
      dragPosition: swipeType === 'drag'
        ? state.getPosition(swipeType, laneId) : null,//{x, y}
      dragConstraints: swipeType === 'drag'
        ? state.getConstraints(swipeType, laneId) : null//{minX, maxX, minY, maxY}
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
    const modifiable = !!(ds.modifiable !== undefined || ds.snapX !== undefined || ds.snapY !== undefined)

    return {
      press: pressable,
      pressRelease: pressable,
      pressCancel: pressable || swipeable,
      swipeStart: swipeable,
      swipe: swipeable,
      swipeCommit: swipeable,
      swipeRevert: swipeable,
      select: selectable,
      deselect: selectable,
      snap: modifiable
    }
  }
}