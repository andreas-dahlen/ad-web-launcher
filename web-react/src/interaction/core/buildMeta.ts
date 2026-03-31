import { utils } from '@interaction/core/intentUtils'
import type { BaseInteraction, BaseWithSwipe, Context, Reactions } from '@interaction/types/base'
import type { CarouselData, CarouselModifiers, DragData, DragModifiers, SliderData } from '@interaction/types/data'
import { carouselStore } from '@interaction/zunstand/carouselState'
import { dragStore } from '@interaction/zunstand/dragState'
import { sliderStore } from '@interaction/zunstand/sliderState'
import { domQuery } from '@interaction/core/domQuery'
import type { ButtonMeta, CarouselMeta, DragMeta, SliderMeta } from '@interaction/types/meta'
import type { Descriptor } from '@interaction/types/descriptor'
import type { RuntimeBase, RuntimeCarousel, RuntimeDrag, RuntimeSlider } from '@interaction/types/ctx'

export interface Builder {
  reactions: Reactions
  x: number
  y: number
  pointerId: number
}

export const buildMeta = {

  /* =========================
    Entry point and Type descrimination
  ========================= */
  resolveFromElement(el: HTMLElement, x: number, y: number, pointerId: number): Descriptor | null {
    const ctx = utils.buildContext(el)
    const reactions = this.buildReactions(ctx.ds, ctx.laneValid)
    const r = { reactions, x, y, pointerId }
    switch (ctx.type) {
      case 'carousel': return {
        type: "carousel",
        meta: this.buildCarousel(ctx, r),
        ctx: this.buildCarouselCtx()
      }
      case 'slider': return {
        type: "slider",
        meta: this.buildSlider(ctx, r),
        ctx: this.buildSliderCtx()
      }
      case 'drag': return {
        type: "drag",
        meta: this.buildDrag(ctx, r),
        ctx: this.buildDragCtx()
      }
      case 'button': return {
        type: "button",
        meta: this.buildButton(ctx, r),
        ctx: this.buildBtnCtx()
      }
      default: return null
    }
  },
  buildCarousel(ctx: Context, r: Builder): CarouselMeta {
    return {
      base: this.buildSwipeBase(ctx, r),
      data: this.buildCarouselData(ctx),
      reactions: r.reactions
    }
  },
  buildSlider(ctx: Context, r: Builder): SliderMeta {
    return {
      base: this.buildSwipeBase(ctx, r),
      data: this.buildSliderData(ctx),
      reactions: r.reactions
    }
  },
  buildDrag(ctx: Context, r: Builder): DragMeta {
    return {
      base: this.buildSwipeBase(ctx, r),
      data: this.buildDragData(ctx),
      reactions: r.reactions
    }
  },
  buildButton(ctx: Context, r: Builder): ButtonMeta {
    return {
      base: this.buildBase(ctx, r.pointerId),
      reactions: r.reactions
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
  buildCarouselCtx(): RuntimeCarousel {
    return { event: 'press', stateAccepted: false, delta: { x: 0, y: 0 } }
  },
  buildSliderCtx(): RuntimeSlider {
    return { event: 'press', stateAccepted: false, delta: { x: 0, y: 0 } }
  },
  buildDragCtx(): RuntimeDrag {
    return { event: 'press', stateAccepted: false, delta: { x: 0, y: 0 } }
  },
  buildBtnCtx(): RuntimeBase {
    return { event: 'press', stateAccepted: false }
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
