import { domQuery } from './domQuery.ts'
import { extractDomMeta } from './domMeta.ts'
import { carouselStore } from '@primitives/carousel/store/carouselStore.ts'
import { dragStore } from '@primitives/drag/store/dragStore.ts'
import { sliderStore } from '@primitives/slider/store/sliderStore.ts'
import type { BaseInteraction, DomMeta, Capabilities, BaseWithSwipe } from '../types/base.types.ts'
import type { CarouselData, DragData, ScrollData, SliderData } from '../types/data.types.ts'
import type { CarouselDesc, SliderDesc, DragDesc, ButtonDesc, ScrollDesc } from '../types/descriptor.types.ts'
import type { Descriptor } from '../types/descriptor.types.ts'
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
        if (desc) return desc
        return null
      }
      case 'slider': {
        const desc = this.buildSlider(metaData, r)
        if (desc) return desc
        return null
      }
      case 'drag': {
        const desc = this.buildDrag(metaData, r)
        if (desc) return desc
        return null
      }
      case 'scroll': {
        const desc = this.buildScroll(metaData, r)
        if (desc) return desc
        return null
      }
      case 'button': {
        return this.buildButton(metaData, r)
      }
      default: return null
    }
  },
  buildCarousel(metaData: DomMeta, r: Builder): CarouselDesc | null {
    if (!metaData.axis || metaData.axis === 'both') return null
    const data = this.buildCarouselData(metaData)
    if (data) return {
      type: 'carousel',
      base: { ...this.buildSwipeBase(metaData, r), axis: metaData.axis },
      data: data,
      capabilities: r.capabilities
    }
    return null
  },
  buildSlider(metaData: DomMeta, r: Builder): SliderDesc | null {
    if (!metaData.axis || metaData.axis === 'both') return null
    const data = this.buildSliderData(metaData)
    if (data) return {
      type: 'slider',
      base: { ...this.buildSwipeBase(metaData, r), axis: metaData.axis },
      data: data,
      capabilities: r.capabilities
    }
    return null
  },
  buildDrag(metaData: DomMeta, r: Builder): DragDesc | null {
    if (!metaData.axis || metaData.axis !== 'both') return null
    const data = this.buildDragData(metaData)
    if (data) return {
      type: 'drag',
      base: { ...this.buildSwipeBase(metaData, r), axis: metaData.axis },
      data: data,
      capabilities: r.capabilities
    }
    return null
  },

  buildScroll(metaData: DomMeta, r: Builder): ScrollDesc | null {
    if (!metaData.axis || metaData.axis === 'both') return null
    const data = this.buildScrollData(metaData)
    if (data) return {
      type: 'scroll',
      base: { ...this.buildSwipeBase(metaData, r), axis: metaData.axis },
      data: data,
      capabilities: r.capabilities
    }
    return null
  },

  buildButton(metaData: DomMeta, r: Builder): ButtonDesc {
    return {
      type: 'button',
      base: this.buildBase(metaData, r.pointerId),
      capabilities: r.capabilities
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
      grabOffset: grabOffset,
      frame: frame
    }
  },

  /* =========================
    Build Data
  ========================= */

  buildCarouselData(metaData: DomMeta): (CarouselData) | null {
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
  buildDragData(metaData: DomMeta): DragData | null {
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
