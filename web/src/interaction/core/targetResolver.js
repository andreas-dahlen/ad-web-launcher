import { state } from '../state/stateManager'

export const targetResolver = {
  resolveFromElement(el) {
    if (!el) return null

    const ctx = this.buildContext(el)
    if (!ctx) return null

    const modifiers = this.buildModifiers(ctx)
    const reactions = this.buildReactions(ctx.ds, ctx.laneValid)

    return {
      ...this.buildBase(ctx),
      ...this.buildSwipe(ctx),
      ...modifiers,
      reactions
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
    const lockPrevAt = ds.lockPrevAt != null ? Number(ds.lockPrevAt) : null
    const lockNextAt = ds.lockNextAt != null ? Number(ds.lockNextAt) : null
    const locked = ds.locked === 'true'
    return { el, ds, laneId, axis, swipeType, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked }
  },

  buildBase(ctx) {
    return {
      element: ctx.el,
      laneId: ctx.laneValid ? ctx.laneId : null,
      axis: ctx.laneValid ? ctx.axis : null,
      swipeType: ctx.laneValid ? ctx.swipeType : null,
      actionId: ctx.ds.action || null,
      startOffset: null
    }
  },

  buildSwipe(ctx) {
    if (!ctx.laneValid) return {}
    const { laneId, swipeType } = ctx
    return {
      //ALL
      laneSize: state.getSize(swipeType, laneId),//{x, y}
      // CAROUSEL
      currentIndex: swipeType === 'carousel'
        ? state.getCurrentIndex(swipeType, laneId) : null,
      // //SLIDER
      sliderThumbSize: swipeType === 'slider'
        ? state.getThumbSize(swipeType, laneId) : null,
      sliderConstraints: swipeType === 'slider'
        ? state.getConstraints(swipeType, laneId) : null,//{min, max}
      //DRAG
      dragPosition: swipeType === 'drag'
        ? state.getPosition(swipeType, laneId) : null,//{x, y}
      dragConstraints: swipeType === 'drag'
        ? state.getConstraints(swipeType, laneId) : null//{minX, maxX, minY, maxY}
    }
  },

  buildModifiers(ctx) {
    return {
      snap: ctx.snapX != null && ctx.snapY != null ? { x: ctx.snapX, y: ctx.snapY } : null,
      lockSwipeAt: ctx.lockPrevAt != null && ctx.lockNextAt != null ? { prev: ctx.lockPrevAt, next: ctx.lockNextAt } : null,
      locked: ctx.locked
    }
  },

  buildReactions(ds, laneValid) {
    const pressable = !!(ds.press !== undefined || ds.reactPress !== undefined || ds.action !== undefined)

    const swipeable = !!(
      (ds.swipe !== undefined ||
        ds.reactSwipe !== undefined ||
        ds.reactSwipeStart !== undefined ||
        laneValid)
    ) && ds.locked !== true

    const modifiable = !!(
      ds.modifiable !== undefined ||
      ds.snapX !== undefined ||
      ds.snapY !== undefined ||
      ds.lockPrevAt !== undefined ||
      ds.lockNextAt !== undefined ||
      ds.locked !== undefined)

    return {
      pressable: pressable,
      swipeable: swipeable,
      modifiable: modifiable,
    }
  },

  isEligible(reactions) {
    return reactions.pressable || reactions.swipeable || reactions.modifiable
  },

  resolveFromPoint(x, y) {
    const elements = document.elementsFromPoint(x, y)
    for (const el of elements) {
      const ctx = this.buildContext(el)
      if (!ctx) continue
      const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
      if (this.isEligible(reactions)) return this.resolveFromElement(el)
    }
    return null
  },
  resolveLaneByAxis(x, y, inputAxis) {
    const el = document.elementsFromPoint(x, y).find(el => {
      const ds = el.dataset || {}
      const locked = ds.locked === 'true' // read as boolean
      const laneValid = ds.lane && ds.axis && (ds.axis === inputAxis || ds.axis === 'both')
      // skip locked lanes for swipe start
      return laneValid && !locked
    })

    return el ? this.resolveFromElement(el) : null
  }
}