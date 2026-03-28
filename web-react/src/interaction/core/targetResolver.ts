import type { Axis, DataKeys, EventType, InteractionType } from '@interaction/types/primitives.ts'
import { utils } from './intentUtils.ts'
import { type ButtonDescriptor, type CarouselDescriptor, type Descriptor, type DragDescriptor, type SliderDescriptor } from '@interaction/types/descriptor.ts'
import type { BaseInteraction, BaseWithSwipe, Builder, ButtonContext, CarouselContext, Context, DragContext, Reactions, SliderContext } from '@interaction/types/base.ts'
import type { CarouselData, CarouselModifiers, DragData, DragModifiers, SliderData } from '@interaction/types/data.ts'
import { carouselStore } from '@interaction/zunstand/carouselState.ts'
import { sliderStore } from '@interaction/zunstand/sliderState.ts'
import { dragStore } from '@interaction/zunstand/dragState.ts'


export const targetResolver = {
  resolveFromElement(el: HTMLElement, x: number, y: number, pointerId: number, event: EventType): Descriptor | null {
    const ctx = this.buildContext(el)
    const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
    const r = { reactions, x, y, pointerId, event }
    switch (ctx.type) {
      case 'carousel':
        return this.buildCarousel(ctx, r)
      case 'slider':
        return this.buildSlider(ctx, r)
      case 'drag':
        return this.buildDrag(ctx, r)
      case 'button':
        return this.buildButton(ctx, r)
      default:
        return null
    }
  },
  buildCarousel(ctx: CarouselContext, r: Builder): CarouselDescriptor {
    return {
      base: this.buildSwipeBase<'carousel'>(ctx, r),
      data: this.buildCarouselData(ctx),
      reactions: r.reactions,
      solutions: { stateAccepted: false }
    }
  },
  buildSlider(ctx: SliderContext, r: Builder): SliderDescriptor {
    return {
      base: this.buildSwipeBase<'slider'>(ctx, r),
      data: this.buildSliderData(ctx),
      reactions: r.reactions,
      solutions: { stateAccepted: false }
    }
  },
  buildDrag(ctx: DragContext, r: Builder): DragDescriptor {
    return {
      base: this.buildSwipeBase<'drag'>(ctx, r),
      data: this.buildDragData(ctx),
      reactions: r.reactions,
      solutions: { stateAccepted: false }
    }
  },
  buildButton(ctx: ButtonContext, r: Builder): ButtonDescriptor {
    return {
      base: this.buildBase<'button'>(ctx, r.pointerId, r.event, ctx.type),
      reactions: r.reactions,
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

  buildBase<T extends InteractionType>(ctx: Context, pointerId: number, event: EventType, type: T): BaseInteraction & { type: T } {
    return {
      type: type,
      event: event,
      pointerId: pointerId,
      element: ctx.el,
      id: ctx.id,
      actionId: ctx.ds.action ?? undefined,

    }
  },

  buildSwipe<T extends DataKeys>(base: BaseInteraction & { type: T }, ctx: Context, x: number, y: number): BaseWithSwipe<T> {
    return {
      ...base,
      delta: { x: x, y: y },
      axis: ctx.laneValid && ctx.axis != null ? ctx.axis : null,
      baseOffset: utils.resolveStartOffset(x, y, ctx.el)
    }
  },
  buildSwipeBase<T extends DataKeys>(ctx: Context, r: Builder): BaseWithSwipe<T> {
    const base = this.buildBase<T>(ctx, r.pointerId, r.event, ctx.type as T)
    return this.buildSwipe<T>(base, ctx, r.x, r.y)
  },

  buildCarouselData(ctx: Context): CarouselData & CarouselModifiers {
    const s = carouselStore.getState().get(ctx.id)
    const lockSwipeAt = { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
    return { index: s.index, size: s.size, lockSwipeAt }
  },
  buildSliderData(ctx: Context): SliderData {
    const s = sliderStore.getState().get(ctx.id)
    return { thumbSize: s.thumbSize, constraints: { min: s.min, max: s.max }, size: s.size }
  },
  buildDragData(ctx: Context): DragData & DragModifiers {
    const s = dragStore.getState().get(ctx.id)
    const snap = (ctx.snapX != null && ctx.snapY != null) ? { x: ctx.snapX, y: ctx.snapY } : undefined
    const c = { minX: s.minX, maxX: s.maxX, minY: s.minY, maxY: s.maxY }
    return { position: s.position, constraints: c, snap: snap, locked: ctx.locked }
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