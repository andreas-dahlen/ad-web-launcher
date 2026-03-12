import { state } from '../state/stateManager.ts'
import type { Descriptor, SwipeData, Reactions, GestureType, Axis, BaseDescriptor, CarouselData, SliderData, DragData, Vec2 } from '../../types/gestures.ts'

interface Context {
  el: HTMLElement
  ds: DOMStringMap
  id: string
  axis: Axis | null
  type: GestureType
  laneValid: boolean
  snapX: number | null
  snapY: number | null
  lockPrevAt: number | null
  lockNextAt: number | null
  locked: boolean
}

export const targetResolver = {
  resolveFromElement(el: HTMLElement | null): Descriptor | null {
    if (!el) return null

    const ctx = this.buildContext(el)
    if (!ctx) return null

    const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
    const base = this.buildBase(ctx)
    const swipe = this.buildSwipe(ctx)
    const modifiers = this.buildModifiers(ctx, swipe)

    // Deep merge sub-objects (modifiers may add to carousel/drag)
    const result: Descriptor = {
      ...base,
      reactions,
      ...swipe,
      ...modifiers
    } as Descriptor
    return result
  },

  buildContext(el: HTMLElement): Context {
    const ds = el.dataset || {}
    const id = ds.id != null ? ds.id : ''
    const axis = ds.axis as Axis || null
    const type = ds.type as GestureType || null
    const laneValid = Boolean(id && axis && type)
    const snapX = ds.snapX != null ? Number(ds.snapX) : null
    const snapY = ds.snapY != null ? Number(ds.snapY) : null
    const lockPrevAt = ds.lockPrevAt != null ? Number(ds.lockPrevAt) : null
    const lockNextAt = ds.lockNextAt != null ? Number(ds.lockNextAt) : null
    const locked = ds.locked === 'true'
    return { el, ds, id, axis, type, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked }
  },

  buildBase(ctx: Context): BaseDescriptor {
    return {
      element: ctx.el,
      id: ctx.laneValid && ctx.id != null ? ctx.id : '',
      axis: ctx.laneValid && ctx.axis != null ? ctx.axis : undefined,
      type: ctx.laneValid && ctx.type != null ? ctx.type : undefined,
      actionId: ctx.ds.action ?? undefined,
      startOffset: undefined
    }
  },

  buildSwipe(ctx: Context): SwipeData {
    if (!ctx.laneValid) return {}
    const { id, type } = ctx

    let result: SwipeData = {}

    if (type === 'carousel') {
      const index = state.getCurrentIndex(type, id) as number
      const size = state.getSize(type, id) as Vec2 //{x, y}
      if (index && size) {
        const myCarousel: CarouselData = {index, size}
        result = { carousel: myCarousel}
        // const carouselPayload = {index, size}
        // result.carousel = carouselPayload
      }
    }

    if (type === 'slider') {
      const thumbSize = state.getThumbSize(type, id) as Vec2
      const constraints = state.getConstraints(type, id) as SliderData["constraints"]
      const size = state.getSize(type, id) as Vec2//{x, y}
      if (thumbSize && constraints && size) {
        const mySlider: SliderData = {thumbSize, constraints, size}
        result = { slider: mySlider }
      }
    }

    if (type === 'drag') {
      const position = state.getPosition(type, id) as Vec2//{x, y}
      const constraints = state.getConstraints(type, id) as DragData["constraints"]//{minX, maxX, minY, maxY}
      if (position && constraints) {
        const myDrag: DragData = { position, constraints}
        result = { drag: myDrag }
      }
    }
    return result
  },

  buildModifiers(ctx: Context, baseSwipe?: SwipeData): SwipeData {
    const result: SwipeData = {}
    const snap = ctx.snapX != null && ctx.snapY != null
      ? { x: ctx.snapX, y: ctx.snapY }
      : undefined

    const lockSwipeAt = ctx.lockPrevAt != null && ctx.lockNextAt != null
      ? { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
      : undefined

    if (snap || ctx.locked) {
      if (baseSwipe?.drag) {
        // Merge into existing drag
        result.drag = {
          ...(baseSwipe?.drag ?? {}),
          snap,
          locked: ctx.locked
        }
      }
    }

    if (lockSwipeAt) {
      if (baseSwipe?.carousel) {
        result.carousel = {
          ...(baseSwipe.carousel ?? {}),
          lockSwipeAt
        }
      }
    }
    return result
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
      if (this.isEligible(reactions)) return this.resolveFromElement(el)
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

    return el ? this.resolveFromElement(el) : null
  }
}