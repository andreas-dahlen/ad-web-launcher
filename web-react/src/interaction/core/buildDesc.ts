import { domQuery } from '@interaction/core/domQuery'
import { buildContext } from '@interaction/core/buildContext'
import { carouselStore } from '@interaction/stores/carouselStore'
import { dragStore } from '@interaction/stores/dragStore'
import { sliderStore } from '@interaction/stores/sliderStore'
import type { BaseInteraction, BaseWithSwipe, Context, Reactions } from '@interaction/types/descriptor/baseType'
import type { CarouselData, CarouselModifiers, DragData, DragModifiers, SliderData } from '@interaction/types/descriptor/dataType'
import type { CarouselDesc, SliderDesc, DragDesc, ButtonDesc } from '@interaction/types/descriptor/descriptor'
import type { Descriptor } from '@interaction/types/descriptor/descriptor'
import type { CtxButton, CtxCarousel, CtxDrag, CtxSlider } from '@interaction/types/ctxType'

export interface Builder {
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
      case 'carousel': return {
        type: "carousel",
        ...this.buildCarousel(ctx, r)
      }
      case 'slider': return {
        type: "slider",
        ...this.buildSlider(ctx, r)
      }
      case 'drag': return {
        type: "drag",
        ...this.buildDrag(ctx, r)
      }
      case 'button': return {
        type: "button",
        ...this.buildButton(ctx, r)
      }
      default: return null
    }
  },
  buildCarousel(ctx: Context, r: Builder): CarouselDesc {
    return {
      base: this.buildSwipeBase(ctx, r),
      data: this.buildCarouselData(ctx),
      reactions: r.reactions,
      ctx: this.buildCarouselCtx(ctx)
    }
  },
  buildSlider(ctx: Context, r: Builder): SliderDesc {
    return {
      base: this.buildSwipeBase(ctx, r),
      data: this.buildSliderData(ctx),
      reactions: r.reactions,
      ctx: this.buildSliderCtx(ctx)
    }
  },
  buildDrag(ctx: Context, r: Builder): DragDesc {
    return {
      base: this.buildSwipeBase(ctx, r),
      data: this.buildDragData(ctx),
      reactions: r.reactions,
      ctx: this.buildDragCtx(ctx)
    }
  },
  buildButton(ctx: Context, r: Builder): ButtonDesc {
    return {
      base: this.buildBase(ctx, r.pointerId),
      reactions: r.reactions,
      ctx: this.buildBtnCtx(ctx)
    }
  },

  /* =========================
      Build Base
    ========================= */

  buildBase(ctx: Context, pointerId: number): BaseInteraction {
    return {
      pointerId: pointerId,
      element: ctx.el,
      id: ctx.id,
      actionId: ctx.ds.action ?? undefined,
    }
  },

  buildSwipeBase(ctx: Context, r: Builder): BaseWithSwipe {
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

  buildCarouselData(ctx: Context): CarouselData & CarouselModifiers {
    const s = carouselStore.getState().get(ctx.id)!
    const lockSwipeAt = { prev: ctx.lockPrevAt, next: ctx.lockNextAt }
    return { index: s.index, size: s.size, lockSwipeAt }
  },
  buildSliderData(ctx: Context): SliderData {
    const s = sliderStore.getState().get(ctx.id)!
    return { thumbSize: s.thumbSize, constraints: { min: s.min, max: s.max }, size: s.size }
  },
  buildDragData(ctx: Context): DragData & DragModifiers {
    const s = dragStore.getState().get(ctx.id)!
    const snap = (ctx.snapX != null && ctx.snapY != null) ? { x: ctx.snapX, y: ctx.snapY } : undefined
    const c = { minX: s.minX, maxX: s.maxX, minY: s.minY, maxY: s.maxY }
    return { position: s.position, constraints: c, snap: snap, locked: ctx.locked }
  },

  /* =========================
    ctx placeholders
  ========================= */
  buildCarouselCtx(ctx: Context): CtxCarousel {
    return { type: 'carousel', event: 'press', id: ctx.id, element: ctx.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildSliderCtx(ctx: Context): CtxSlider {
    return { type: 'slider', event: 'press', id: ctx.id, element: ctx.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildDragCtx(ctx: Context): CtxDrag {
    return { type: 'drag', event: 'press', id: ctx.id, element: ctx.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildBtnCtx(ctx: Context): CtxButton {
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
