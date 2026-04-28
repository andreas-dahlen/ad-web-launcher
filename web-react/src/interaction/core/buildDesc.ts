import { domQuery } from './domQuery.ts'
import { extractDomMeta } from './domMeta.ts'
import { carouselStore } from '../../stores/carouselStore.ts'
import { dragStore } from '../../stores/dragStore.ts'
import { sliderStore } from '../../stores/sliderStore.ts'
import type { BaseInteraction, BaseWithSwipe, DomMeta, Capabilities } from '../../typeScript/descriptor/baseType.ts'
import type { CarouselData, CarouselModifiers, DragData, DragModifiers, SliderData } from '../../typeScript/descriptor/dataType.ts'
import type { CarouselDesc, SliderDesc, DragDesc, ButtonDesc } from '../../typeScript/descriptor/descriptor.ts'
import type { Descriptor } from '../../typeScript/descriptor/descriptor.ts'
import type { CtxButton, CtxCarousel, CtxDrag, CtxSlider } from '../../typeScript/descriptor/ctxType.ts'

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
    return {
      ...base,
      axis: metaData.axis ?? 'both',
      baseOffset: domQuery.resolveElOffsetInDom(r.x, r.y, metaData.el)
    }
  },

  /* =========================
    Build Data
  ========================= */

  buildCarouselData(metaData: DomMeta): (CarouselData & CarouselModifiers) | null {
    const s = carouselStore.getState().get(metaData.id)
    if (!s) return null
    const lockSwipeAt = { prev: metaData.lockPrevAt, next: metaData.lockNextAt }
    return { index: s.index, size: s.size, lockSwipeAt }
  },
  buildSliderData(metaData: DomMeta): SliderData | null {
    const s = sliderStore.getState().get(metaData.id)
    if (!s) return null
    return { thumbSize: s.thumbSize, constraints: { min: s.min, max: s.max }, size: s.size }
  },
  buildDragData(metaData: DomMeta): DragData & DragModifiers | null {
    const s = dragStore.getState().get(metaData.id)
    if (!s) return null
    const snap = (metaData.snapX != null && metaData.snapY != null) ? { x: metaData.snapX, y: metaData.snapY } : undefined
    return { position: s.position, layout: s.layout, snap: snap, locked: metaData.locked }
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
  buildBtnCtx(metaData: DomMeta): CtxButton {
    return { type: 'button', event: 'press', id: metaData.id, element: metaData.el, storeAccepted: false }
  },

  /* =========================
      Build capabilities
    ========================= */
  buildCapabilities(metaData: DomMeta): Capabilities {
    const { ds, pressValid, swipeValid } = metaData

    const pressable = !!(
      pressValid ||
      ds.action !== undefined)

    const swipeable =
      swipeValid &&
      ds.locked !== 'true'

    return {
      pressable: pressable,
      swipeable: swipeable,
    }
  }
}
