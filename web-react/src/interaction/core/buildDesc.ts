import { domQuery } from './domQuery.ts'
import { buildContext } from './buildContext.ts'
import { carouselStore } from '../stores/carouselStore.ts'
import { dragStore } from '../stores/dragStore.ts'
import { sliderStore } from '../stores/sliderStore.ts'
import type { BaseInteraction, BaseWithSwipe, DomContext, Reactions } from '../types/descriptor/baseType.ts'
import type { CarouselData, CarouselModifiers, DragData, DragModifiers, SliderData } from '../types/descriptor/dataType.ts'
import type { CarouselDesc, SliderDesc, DragDesc, ButtonDesc } from '../types/descriptor/descriptor.ts'
import type { Descriptor } from '../types/descriptor/descriptor.ts'
import type { CtxButton, CtxCarousel, CtxDrag, CtxSlider } from '../types/ctxType.ts'

interface Builder {
  reactions: Reactions
  x: number
  y: number
  pointerId: number
}

export const buildDesc = {

  /* =========================
    Entry point and Type descrimination
  ========================= */
  resolveFromElement(el: HTMLElement, x: number, y: number, pointerId: number): Descriptor | null {
    const ctx = buildContext(el)
    if (!ctx) return null
    const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
    const r = { reactions, x, y, pointerId }
    switch (ctx.type) {
      case 'carousel': {
        const desc = this.buildCarousel(ctx, r)
        if (desc) return { type: "carousel", ...desc }
        return null
      }
      case 'slider': {
        const desc = this.buildSlider(ctx, r)
        if (desc) return { type: "slider", ...desc }
        return null
      }
      case 'drag': {
        const desc = this.buildDrag(ctx, r)
        if (desc) return { type: "drag", ...desc }
        return null
      }
      case 'button': return {
        type: "button",
        ...this.buildButton(ctx, r)
      }
      default: return null
    }
  },
  buildCarousel(ctx: DomContext, r: Builder): CarouselDesc | null {
    const data = this.buildCarouselData(ctx)
    if (data) return {
      base: this.buildSwipeBase(ctx, r),
      data: data,
      reactions: r.reactions,
      ctx: this.buildCarouselCtx(ctx)
    }
    return null
  },
  buildSlider(ctx: DomContext, r: Builder): SliderDesc | null {
    const data = this.buildSliderData(ctx)
    if (data) return {
      base: this.buildSwipeBase(ctx, r),
      data: data,
      reactions: r.reactions,
      ctx: this.buildSliderCtx(ctx)
    }
    return null
  },
  buildDrag(ctx: DomContext, r: Builder): DragDesc | null {
    const data = this.buildDragData(ctx)
    if (data) return {
      base: this.buildSwipeBase(ctx, r),
      data: data,
      reactions: r.reactions,
      ctx: this.buildDragCtx(ctx)
    }
    return null
  },
  buildButton(ctx: DomContext, r: Builder): ButtonDesc {
    return {
      base: this.buildBase(ctx, r.pointerId),
      reactions: r.reactions,
      ctx: this.buildBtnCtx(ctx)
    }
  },

  /* =========================
      Build Base
    ========================= */

  buildBase(ctx: DomContext, pointerId: number): BaseInteraction {
    return {
      pointerId: pointerId,
      element: ctx.el,
      id: ctx.id,
      actionId: ctx.ds.action ?? undefined,
    }
  },

  buildSwipeBase(ctx: DomContext, r: Builder): BaseWithSwipe {
    const base = this.buildBase(ctx, r.pointerId)
    return {
      ...base,
      axis: ctx.axis ?? 'both',
      baseOffset: domQuery.resolveElOffsetInDom(r.x, r.y, ctx.el)
    }
  },

  /* =========================
    Build Data
  ========================= */

  buildCarouselData(ctx: DomContext): (CarouselData & CarouselModifiers) | null {
    const s = carouselStore.getState().get(ctx.id)
    if (!s) return null
    const lockSwipeAt = { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
    return { index: s.index, size: s.size, lockSwipeAt }
  },
  buildSliderData(ctx: DomContext): SliderData | null {
    const s = sliderStore.getState().get(ctx.id)
    if (!s) return null
    return { thumbSize: s.thumbSize, constraints: { min: s.min, max: s.max }, size: s.size }
  },
  buildDragData(ctx: DomContext): DragData & DragModifiers | null {
    const s = dragStore.getState().get(ctx.id)
    if (!s) return null
    const snap = (ctx.snapX != null && ctx.snapY != null) ? { x: ctx.snapX, y: ctx.snapY } : undefined
    const c = { minX: s.minX, maxX: s.maxX, minY: s.minY, maxY: s.maxY }
    return { position: s.position, constraints: c, snap: snap, locked: ctx.locked }
  },

  /* =========================
    ctx placeholders
  ========================= */
  buildCarouselCtx(ctx: DomContext): CtxCarousel {
    return { type: 'carousel', event: 'press', id: ctx.id, element: ctx.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildSliderCtx(ctx: DomContext): CtxSlider {
    return { type: 'slider', event: 'press', id: ctx.id, element: ctx.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildDragCtx(ctx: DomContext): CtxDrag {
    return { type: 'drag', event: 'press', id: ctx.id, element: ctx.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildBtnCtx(ctx: DomContext): CtxButton {
    return { type: 'button', event: 'press', id: ctx.id, element: ctx.el, storeAccepted: false }
  },

  /* =========================
      Build Reactions
    ========================= */

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
  }
}
