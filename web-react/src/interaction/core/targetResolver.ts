import { state } from '../state/stateManager.ts'
import type { Descriptor, Reactions, Axis, SliderData, DragData, Vec2, RuntimeData, InteractionType, SwipeData, Modifiers, BaseInteraction } from '../../types/gestures.ts'
import { isGestureType } from '../../utils/gestureTypeGuards.ts'
import { utils } from './intentUtils.ts'

interface Context {
  el: HTMLElement
  ds: DOMStringMap
  id: string
  axis: Axis | null
  type: InteractionType
  laneValid: boolean
  snapX: number | null
  snapY: number | null
  lockPrevAt: number | null
  lockNextAt: number | null
  locked: boolean
}

export const targetResolver = {
  resolveFromElement(el: HTMLElement | null, x: number, y: number): Descriptor | null {
    if (!el) return null

    const ctx = this.buildContext(el)
    if (!ctx) return null

    const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
    const base = this.buildBase(ctx, x, y)
    const swipe = this.buildSwipe(ctx)
    const modifiers = this.buildModifiers(ctx)

    const runtime: RuntimeData = {
      event: "press", // placeholders
      delta: { x: 0, y: 0 } // placeholders
    }
    const dataPayload = swipe
      ? { ...swipe, ...(modifiers ?? {}) }
      : null
    // Deep merge sub-objects (modifiers may add to carousel/drag)

    return {
      base: base,
      reactions: reactions,
      data: dataPayload,
      runtime: runtime
    } as Descriptor
  },

  buildContext(el: HTMLElement): Context {
    const ds = el.dataset
    const id = ds.id ?? ''
    const axis = (ds.axis as Axis) ?? null
    const type = (ds.type as InteractionType) ?? null
    const laneValid = Boolean(id && axis && isGestureType(type))
    const snapX = ds.snapX != null ? Number(ds.snapX) : null
    const snapY = ds.snapY != null ? Number(ds.snapY) : null
    const lockPrevAt = ds.lockPrevAt != null ? Number(ds.lockPrevAt) : null
    const lockNextAt = ds.lockNextAt != null ? Number(ds.lockNextAt) : null
    const locked = ds.locked === 'true'
    return { el, ds, id, axis, type, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked }
  },

  buildBase(ctx: Context, x: number, y: number): BaseInteraction & { type: InteractionType}{
    return {
      element: ctx.el,
      id: ctx.id,
      type: ctx.type,
      axis: ctx.laneValid && ctx.axis != null ? ctx.axis : null,
      // actionId: ctx.ds.action ?? undefined,
      baseOffset: utils.resolveStartOffset(x, y, ctx.el)
    }
  },

  buildSwipe(ctx: Context): SwipeData | null {
    if (!ctx.laneValid) return null

    const { id, type } = ctx

    // Helper to merge modifiers into data
    const applyModifiers = <T extends SwipeData>(data: T): T => {
      const mods = this.buildModifiers(ctx)
      return mods ? { ...data, ...mods } as T : data
    }

    if (type === 'carousel') {
      const index = state.getCurrentIndex(type, id) as number
      const size = state.getSize(type, id) as Vec2//{x, y}
      if (index != null && size != null) {
        const data = { index, size }
        return applyModifiers(data)
      }
    }

    if (type === 'slider') {
      const thumbSize = state.getThumbSize(type, id) as Vec2
      const constraints = state.getConstraints(type, id) as SliderData["constraints"]
      const size = state.getSize(type, id) as Vec2//{x, y}
      if (thumbSize != null && constraints != null && size != null) {
        const data = { thumbSize, constraints, size }
        return applyModifiers(data)
      }
    }

    if (type === 'drag') {
      const position = state.getPosition(type, id) as Vec2//{x, y}
      const constraints = state.getConstraints(type, id) as DragData["constraints"]//{minX, maxX, minY, maxY}
      if (position != null && constraints != null) {
        const data = { position, constraints }
        return applyModifiers(data)
      }
    }
    return null
  },

  buildModifiers(ctx: Context): Modifiers | null {
    //CAROUSEL
    const lockSwipeAt = ctx.lockPrevAt != null && ctx.lockNextAt != null
      ? { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
      : undefined

    if (ctx.type === 'carousel' && lockSwipeAt) {
      return { lockSwipeAt }
    }
    //DRAG
    const snap = ctx.snapX != null && ctx.snapY != null
      ? { x: ctx.snapX, y: ctx.snapY }
      : undefined
    if (ctx.type === 'drag' && (snap || ctx.locked)) {
      return { snap: snap, locked: ctx.locked }
    }
    return null
  },

  buildReactions(ds: DOMStringMap, laneValid: boolean): Reactions {
    const pressable = !!(ds.press !== undefined || ds.reactPress !== undefined || ds.action !== undefined)

    const swipeable = !!(
      (ds.swipe !== undefined ||
        ds.reactSwipe !== undefined ||
        ds.reactSwipeStart !== undefined ||
        laneValid)
    ) && ds.locked !== 'true'

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

  isEligible(reactions: Reactions): boolean {
    return reactions.pressable || reactions.swipeable || reactions.modifiable
  },

  resolveFromPoint(x: number, y: number): Descriptor | null {
    const elements = document.elementsFromPoint(x, y)
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) continue
      const ctx = this.buildContext(el)
      if (!ctx) continue
      const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
      if (this.isEligible(reactions)) return this.resolveFromElement(el, x, y)
    }
    return null
  },
  resolveLaneByAxis(x: number, y: number, inputAxis: Axis): Descriptor | null {
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

    return el ? this.resolveFromElement(el, x, y) : null
  }
}