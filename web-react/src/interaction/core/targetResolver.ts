import type { Axis, EventType, InteractionType } from '@interaction/types/primitives.ts'
import { state } from '../state/stateManager.ts'
import { utils } from './intentUtils.ts'
import type { Descriptor } from '@interaction/types/descriptor.ts'
import type { SwipeData } from '@interaction/types/data.ts'
import type { BaseInteraction, Reactions } from '@interaction/types/base.ts'

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
  resolveFromElement(el: HTMLElement | null, x: number, y: number, pointerId: number, event: EventType): Descriptor | null {
    if (!el) return null

    const ctx = this.buildContext(el)
    if (!ctx) return null

    const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
    const base = this.buildBase(ctx, x, y, pointerId, event)
    const data = this.buildSwipe(ctx)
    // const modifiers = this.buildModifiers(ctx)

    // // const runtime: RuntimeData = {
    // //   event: "press", // placeholders
    // //   delta: { x: 0, y: 0 } // placeholders
    // // }
    // const dataPayload = swipe
    //   ? { ...swipe, ...(modifiers ?? {}) }
    //   : null
    // // Deep merge sub-objects (modifiers may add to carousel/drag)

    return {
      base: base,
      reactions: reactions,
      data: data,
      runtime: {}
    }
  },

  buildContext(el: HTMLElement): Context {
    const ds = el.dataset
    const id = ds.id ?? ''
    const axis = (ds.axis as Axis) ?? null
    const type = (ds.type as InteractionType) ?? null
    const laneValid = Boolean(id && axis && type)
    const snapX = ds.snapX != null ? Number(ds.snapX) : null
    const snapY = ds.snapY != null ? Number(ds.snapY) : null
    const lockPrevAt = ds.lockPrevAt != null ? Number(ds.lockPrevAt) : null
    const lockNextAt = ds.lockNextAt != null ? Number(ds.lockNextAt) : null
    const locked = ds.locked === 'true'
    return { el, ds, id, axis, type, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked }
  },

  buildBase(ctx: Context, x: number, y: number, pointerId: number, event: EventType): BaseInteraction & { type: InteractionType } {
    return {
      type: ctx.type,
      event: event,
      delta: { x: x, y: y },
      pointerId: pointerId,
      element: ctx.el,
      id: ctx.id,
      axis: ctx.laneValid && ctx.axis != null ? ctx.axis : null,
      baseOffset: utils.resolveStartOffset(x, y, ctx.el)
      // actionId: ctx.ds.action ?? undefined,
    }
  },

  buildSwipe(ctx: Context): SwipeData | null {
    if (!ctx.laneValid) return null

    // const { id, type } = ctx


    // Helper to merge modifiers into data
    // const applyModifiers = <T extends SwipeData>(data: T): T => {
    //   const mods = this.buildModifiers(ctx)
    //   return mods ? { ...data, ...mods } as T : data
    // }

    switch (ctx.type) {
      case 'carousel': {
        const index = state.getCurrentIndex(ctx.type, ctx.id)
        const size = state.getSize(ctx.type, ctx.id)
        // const data = {index, size}
        if (index == null || size == null) return null
        const lockSwipeAt = { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
        return { index, size, lockSwipeAt }
      }
      case 'slider': {
        const thumbSize = state.getThumbSize(ctx.type, ctx.id)
        const constraints = state.getConstraints(ctx.type, ctx.id)
        const size = state.getSize(ctx.type, ctx.id)
        if (!thumbSize || !constraints || !size) return null
        return { thumbSize, constraints, size }
      }
      case 'drag': {
        const position = state.getPosition(ctx.type, ctx.id)
        const constraints = state.getConstraints(ctx.type, ctx.id)
        if (!position || !constraints) return null
        const snap = { x: ctx.snapX, y: ctx.snapY }
        return { position, constraints, snap, locked }
      }
      default: return null
    }
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

  resolveFromPoint(x: number, y: number, pointerId: number): Descriptor | null {
    const elements = document.elementsFromPoint(x, y)
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) continue
      const ctx = this.buildContext(el)
      if (!ctx) continue
      const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
      if (this.isEligible(reactions)) return this.resolveFromElement(el, x, y, pointerId, 'press')
    }
    return null
  },
  resolveLaneByAxis(x: number, y: number, inputAxis: Axis, pointerId: number): Descriptor | null {
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

    return el ? this.resolveFromElement(el, x, y, pointerId, 'swipeStart') : null
  }
}