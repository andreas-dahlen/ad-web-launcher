import { state } from '../state/stateManager'

export const targetResolver = {
  resolveFromElement(el) {
    if (!el) return null

    const ctx = this.buildContext(el)
    if (!ctx) return null

    const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
    const base = this.buildBase(ctx)
    const swipe = this.buildSwipe(ctx)
    const modifiers = this.buildModifiers(ctx)

    // Deep merge sub-objects (modifiers may add to carousel/drag)
    const result = { ...base, reactions }
    if (swipe.carousel || modifiers.carousel) {
      result.carousel = { ...swipe.carousel, ...modifiers.carousel }
    }
    if (swipe.slider) {
      result.slider = { ...swipe.slider }
    }
    if (swipe.drag || modifiers.drag) {
      result.drag = { ...swipe.drag, ...modifiers.drag }
    }
    return result
  },

  buildContext(el) {
    const ds = el.dataset || {}
    const id = ds.id || null
    const axis = ds.axis || null
    const type = ds.type || null
    const laneValid = Boolean(id && axis && type)
    const snapX = ds.snapX != null ? Number(ds.snapX) : null
    const snapY = ds.snapY != null ? Number(ds.snapY) : null
    const lockPrevAt = ds.lockPrevAt != null ? Number(ds.lockPrevAt) : null
    const lockNextAt = ds.lockNextAt != null ? Number(ds.lockNextAt) : null
    const locked = ds.locked === 'true'
    return { el, ds, id, axis, type, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked }
  },

  buildBase(ctx) {
    return {
      element: ctx.el,
      id: ctx.laneValid ? ctx.id : null,
      axis: ctx.laneValid ? ctx.axis : null,
      type: ctx.laneValid ? ctx.type : null,
      actionId: ctx.ds.action || null,
      startOffset: null
    }
  },

  buildSwipe(ctx) {
    if (!ctx.laneValid) return {}
    const { id, type } = ctx
    const result = {}

    if (type === 'carousel') {
      result.carousel = {
        index: state.getCurrentIndex(type, id),
        size: state.getSize(type, id), //{x, y}
      }
    }
    if (type === 'slider') {
      result.slider = {
        thumbSize: state.getThumbSize(type, id),
        constraints: state.getConstraints(type, id), //{min, max}
        size: state.getSize(type, id), //{x, y}
      }
    }
    if (type === 'drag') {
      result.drag = {
        position: state.getPosition(type, id), //{x, y}
        constraints: state.getConstraints(type, id), //{minX, maxX, minY, maxY}
      }
    }
    return result
  },

  buildModifiers(ctx) {
    const result = {}
    const snap = ctx.snapX != null && ctx.snapY != null ? { x: ctx.snapX, y: ctx.snapY } : null
    const lockSwipeAt = ctx.lockPrevAt != null && ctx.lockNextAt != null ? { prev: ctx.lockPrevAt, next: ctx.lockNextAt } : null
    const locked = ctx.locked

    if (snap != null || locked) {
      result.drag = { snap, locked }
    }
    if (lockSwipeAt != null) {
      result.carousel = { lockSwipeAt }
    }
    return result
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
      const laneValid = ds.id && ds.axis && (ds.axis === inputAxis || ds.axis === 'both')
      // skip locked lanes for swipe start
      return laneValid && !locked
    })

    return el ? this.resolveFromElement(el) : null
  }
}