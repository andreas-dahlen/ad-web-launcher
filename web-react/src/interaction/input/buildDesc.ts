import { domQuery } from './domQuery.ts'
import { extractDomMeta } from './domMeta.ts'
import { carouselStore } from '@primitives/carousel/store/carouselStore.ts'
import { dragStore } from '@primitives/drag/store/dragStore.ts'
import { sliderStore } from '@primitives/slider/store/sliderStore.ts'
import { scrollStore } from '@primitives/scroll/store/scrollStore.ts'
import type { BaseInteraction, DomMeta, Capabilities, BaseWithSwipe, LayoutData } from '../types/base.types.ts'
import type { CarouselData, DragData, ScrollData, SliderData } from '../types/data.types.ts'
import type { CarouselDesc, SliderDesc, DragDesc, ButtonDesc, ScrollDesc } from '../types/descriptor.types.ts'
import type { Descriptor } from '../types/descriptor.types.ts'
import { sizeStore } from '../../shared/runtime/sizeStore.ts'

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
    const layout = this.buildLayout(metaData, r)
    return {
      ...base,
      layout: layout
    }
  },

  buildLayout(metaData: DomMeta, r: Builder): LayoutData {
    const d = sizeStore.getState().device
    const deviceSize = { width: d.width, height: d.height }
    const { grabOffset, frame } = domQuery.getElSnapshot(r.x, r.y, metaData.el)
    switch (metaData.type) {
      case 'carousel': {
        const s = carouselStore.getState().get(metaData.id)
        return { ...s.layout, grabOffset, frameRect: frame, deviceSize }
      }
      case 'slider': {
        const s = sliderStore.getState().get(metaData.id)
        return { ...s.layout, grabOffset, frameRect: frame, deviceSize }
      }

      case 'drag': {
        // dragStore.getState().setFrameRect(metaData.id, frame)
        const s = dragStore.getState().get(metaData.id)
        return { ...s?.layout, grabOffset, frameRect: frame, deviceSize }
      }

      case 'scroll': {
        const s = scrollStore.getState().get(metaData.id)
        return { ...s.layout, grabOffset, frameRect: frame, deviceSize }
      }
      default: throw new Error(`metaData.type error: ${metaData.type}`)
    }
  },
  /* =========================
    Build Data
  ========================= */

  buildCarouselData(metaData: DomMeta): (CarouselData) {
    const s = carouselStore.getState().get(metaData.id)
    const lockSwipeAt = { prev: metaData.lockPrevAt, next: metaData.lockNextAt }
    return { index: s.index, lockSwipeAt }
  },
  buildSliderData(metaData: DomMeta): SliderData {
    const s = sliderStore.getState().get(metaData.id)
    return { constraints: { min: s.min, max: s.max } }
  },
  buildDragData(metaData: DomMeta): DragData | null {
    const s = dragStore.getState().get(metaData.id)
    const snap = (metaData.snapX != null && metaData.snapY != null) ? { x: metaData.snapX, y: metaData.snapY } : undefined
    return { settledOffset: s.settledOffset, snap: snap, constraints: s.constraints }
  },
  buildScrollData(metaData: DomMeta): ScrollData | null {
    const s = scrollStore.getState().get(metaData.id)
    const onEdgeDir = metaData.onEdgeDir != null ? metaData.onEdgeDir : undefined
    return { onEdgeDir, settledValue: s.settledValue, isVisible: s.isVisible }
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
