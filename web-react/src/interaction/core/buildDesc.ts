import { domQuery } from './domQuery.ts'
import { extractDomMeta } from './domMeta.ts'
import { carouselStore } from '@primitives/carousel/store/carouselStore.ts'
import { dragStore } from '@primitives/drag/store/dragStore.ts'
import { sliderStore } from '@primitives/slider/store/sliderStore.ts'
import type { BaseInteraction, BaseWithSwipe, DomMeta, Capabilities } from '../types/base.types.ts'
import type { CarouselData, CarouselModifiers, DragData, DragModifiers, ScrollData, SliderData } from '../types/data.types.ts'
import type { CarouselDesc, SliderDesc, DragDesc, ButtonDesc, ScrollDesc } from '../types/descriptor.types.ts'
import type { Descriptor } from '../types/descriptor.types.ts'
import type { CtxButton, CtxCarousel, CtxDrag, CtxScroll, CtxSlider } from '../types/ctx.types.ts'
import { scrollStore } from '@primitives/scroll/store/scrollStore.ts'

interface Builder {
  capabilities: Capabilities
  x: number
  y: number
  pointerId: number
}

export const buildDesc = {

  /* =========================
    Entry point and Type descrimination
  ========================= */
  resolveFromElement(el: HTMLElement, x: number, y: number, pointerId: number): Descriptor | null {
    const metaData = extractDomMeta(el)
    if (!metaData) return null
    const capabilities = this.buildCapabilities(metaData)
    const r = { capabilities, x, y, pointerId }
    switch (metaData.type) {
      case 'carousel': {
        const desc = this.buildCarousel(metaData, r)
        if (desc) return { type: "carousel", ...desc }
        return null
      }
      case 'slider': {
        const desc = this.buildSlider(metaData, r)
        if (desc) return { type: "slider", ...desc }
        return null
      }
      case 'drag': {
        const desc = this.buildDrag(metaData, r)
        if (desc) return { type: "drag", ...desc }
        return null
      }
      case 'scroll': {
        const desc = this.buildScroll(metaData, r)
        if (desc) return { type: "scroll", ...desc }
        return null
      }
      case 'button': return {
        type: "button",
        ...this.buildButton(metaData, r)
      }
      default: return null
    }
  },
  buildCarousel(metaData: DomMeta, r: Builder): CarouselDesc | null {
    const data = this.buildCarouselData(metaData)
    if (data) return {
      base: this.buildSwipeBase(metaData, r),
      data: data,
      capabilities: r.capabilities,
      ctx: this.buildCarouselCtx(metaData)
    }
    return null
  },
  buildSlider(metaData: DomMeta, r: Builder): SliderDesc | null {
    const data = this.buildSliderData(metaData)
    if (data) return {
      base: this.buildSwipeBase(metaData, r),
      data: data,
      capabilities: r.capabilities,
      ctx: this.buildSliderCtx(metaData)
    }
    return null
  },
  buildDrag(metaData: DomMeta, r: Builder): DragDesc | null {
    const data = this.buildDragData(metaData)
    if (data) return {
      base: this.buildSwipeBase(metaData, r),
      data: data,
      capabilities: r.capabilities,
      ctx: this.buildDragCtx(metaData)
    }
    return null
  },

  buildScroll(metaData: DomMeta, r: Builder): ScrollDesc | null {
    const data = this.buildScrollData(metaData)
    if (data) return {
      base: this.buildSwipeBase(metaData, r),
      data: data,
      capabilities: r.capabilities,
      ctx: this.buildScrollCtx(metaData)
    }
    return null
  },

  buildButton(metaData: DomMeta, r: Builder): ButtonDesc {
    return {
      base: this.buildBase(metaData, r.pointerId),
      capabilities: r.capabilities,
      ctx: this.buildBtnCtx(metaData)
    }
  },

  /* =========================
      Build Base
    ========================= */
  buildBase(metaData: DomMeta, pointerId: number): BaseInteraction {
    return {
      pointerId: pointerId,
      element: metaData.el,
      id: metaData.id,
      actionId: metaData.ds.action ?? undefined,
    }
  },

  buildSwipeBase(metaData: DomMeta, r: Builder): BaseWithSwipe {
    const base = this.buildBase(metaData, r.pointerId)
    const { grabOffset, frame } = domQuery.getElSnapshot(r.x, r.y, metaData.el)
    return {
      ...base,
      axis: metaData.axis ?? 'both',
      grabOffset: grabOffset,
      frame: frame
    }
  },

  /* =========================
    Build Data
  ========================= */

  buildCarouselData(metaData: DomMeta): (CarouselData & CarouselModifiers) | null {
    const s = carouselStore.getState().get(metaData.id)
    if (!s) return null
    const lockSwipeAt = { prev: metaData.lockPrevAt, next: metaData.lockNextAt }
    return { index: s.index, sceneSize: s.sceneSize, lockSwipeAt }
  },
  buildSliderData(metaData: DomMeta): SliderData | null {
    const s = sliderStore.getState().get(metaData.id)
    if (!s) return null
    return { thumbSize: s.thumbSize, constraints: { min: s.min, max: s.max }, containerSize: s.containerSize }
  },
  buildDragData(metaData: DomMeta): DragData & DragModifiers | null {
    const s = dragStore.getState().get(metaData.id)
    if (!s) return null
    const snap = (metaData.snapX != null && metaData.snapY != null) ? { x: metaData.snapX, y: metaData.snapY } : undefined
    return { settledOffset: s.settledOffset, layout: s.layout, snap: snap }
  },
  buildScrollData(metaData: DomMeta): ScrollData | null {
    const s = scrollStore.getState().get(metaData.id)
    const onEdgeDir = metaData.onEdgeDir != null ? metaData.onEdgeDir : undefined
    if (!s) return null
    return { onEdgeDir, containerSize: s.containerSize, contentSize: s.contentSize, settledValue: s.settledValue, isVisible: s.isVisible }
  },

  /* =========================
    ctx placeholders
  ========================= */
  buildCarouselCtx(metaData: DomMeta): CtxCarousel {
    return { type: 'carousel', event: 'press', id: metaData.id, element: metaData.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildSliderCtx(metaData: DomMeta): CtxSlider {
    return { type: 'slider', event: 'press', id: metaData.id, element: metaData.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildDragCtx(metaData: DomMeta): CtxDrag {
    return { type: 'drag', event: 'press', id: metaData.id, element: metaData.el, delta: { x: 0, y: 0 }, storeAccepted: false }
  },
  buildScrollCtx(metaData: DomMeta): CtxScroll {
    return {
      type: 'scroll', event: 'press', id: metaData.id, element: metaData.el, delta: { x: 0, y: 0 }, storeAccepted: false
    }
  },
  buildBtnCtx(metaData: DomMeta): CtxButton {
    return { type: 'button', event: 'press', id: metaData.id, element: metaData.el }
  },

  /* =========================
      Build capabilities
    ========================= */
  buildCapabilities(metaData: DomMeta): Capabilities {
    const { ds, pressable, swipeable, instantSwipe } = metaData

    const pressConfirm =
      pressable ||
      ds.action !== undefined

    return {
      pressable: pressConfirm,
      swipeable,
      instantSwipe
    }
  }
}
