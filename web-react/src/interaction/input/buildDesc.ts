import { domQuery } from './domQuery.ts'
import { carouselStore } from '@primitives/carousel/store/carousel.store.ts'
import { dragStore } from '@primitives/drag/store/drag.store.ts'
import { sliderStore } from '@primitives/slider/store/slider.store.ts'
import { scrollStore } from '@primitives/scroll/store/scroll.store.ts'
import type { BaseInteraction, DomMeta, Capabilities, BaseWithSwipe, LayoutData } from '../types/base.types.ts'
import type { CarouselData, DragData, ScrollData, SliderData } from '../types/data.types.ts'
import type { CarouselDesc, SliderDesc, DragDesc, ButtonDesc, ScrollDesc } from '../types/descriptor.types.ts'
import type { Descriptor } from '../types/descriptor.types.ts'
import { sizeStore } from '../../shared/stores/size.store.ts'

interface Builder {
  capabilities: Capabilities
  x: number
  y: number
  pointerId: number
}
/* =========================
Entry point and Type descrimination
========================= */
export function compileDescriptor(x: number, y: number, pointerId: number, metaData: DomMeta): Descriptor | null {
  const capabilities = buildCapabilities(metaData)
  const r = { capabilities, x, y, pointerId }
  switch (metaData.type) {
    case 'carousel': {
      const desc = buildCarousel(metaData, r)
      if (desc) return desc
      return null
    }
    case 'slider': {
      const desc = buildSlider(metaData, r)
      if (desc) return desc
      return null
    }
    case 'drag': {
      const desc = buildDrag(metaData, r)
      if (desc) return desc
      return null
    }
    case 'scroll': {
      const desc = buildScroll(metaData, r)
      if (desc) return desc
      return null
    }
    case 'button': {
      return buildButton(metaData, r)
    }
    default: return null
  }
}



function buildCarousel(metaData: DomMeta, r: Builder): CarouselDesc | null {
  if (!metaData.axis || metaData.axis === 'both') return null
  const data = buildCarouselData(metaData)
  return {
    type: 'carousel',
    base: { ...buildSwipeBase(metaData, r), axis: metaData.axis },
    data: data,
    capabilities: r.capabilities
  }
}
function buildSlider(metaData: DomMeta, r: Builder): SliderDesc | null {
  if (!metaData.axis || metaData.axis === 'both') return null
  const data = buildSliderData(metaData)
  return {
    type: 'slider',
    base: { ...buildSwipeBase(metaData, r), axis: metaData.axis },
    data: data,
    capabilities: r.capabilities
  }
}
function buildDrag(metaData: DomMeta, r: Builder): DragDesc | null {
  if (!metaData.axis || metaData.axis !== 'both') return null
  const data = buildDragData(metaData)
  return {
    type: 'drag',
    base: { ...buildSwipeBase(metaData, r), axis: metaData.axis },
    data: data,
    capabilities: r.capabilities
  }
}
function buildScroll(metaData: DomMeta, r: Builder): ScrollDesc | null {
  if (!metaData.axis || metaData.axis === 'both') return null
  const data = buildScrollData(metaData)
  if (data) return {
    type: 'scroll',
    base: { ...buildSwipeBase(metaData, r), axis: metaData.axis },
    data: data,
    capabilities: r.capabilities
  }
  return null
}

function buildButton(metaData: DomMeta, r: Builder): ButtonDesc {
  return {
    type: 'button',
    base: buildBase(metaData, r.pointerId),
    capabilities: r.capabilities
  }
}

/* =========================
    Build Base
  ========================= */
function buildBase(metaData: DomMeta, pointerId: number): BaseInteraction {
  return {
    pointerId: pointerId,
    element: metaData.el,
    id: metaData.id,
    actionId: metaData.ds.action ?? undefined,
  }
}

function buildSwipeBase(metaData: DomMeta, r: Builder): BaseWithSwipe {
  const base = buildBase(metaData, r.pointerId)
  const layout = buildLayout(metaData, r)
  return {
    ...base,
    layout: layout
  }
}

function buildLayout(metaData: DomMeta, r: Builder): LayoutData {
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
      const s = dragStore.getState().get(metaData.id)
      return { ...s?.layout, grabOffset, frameRect: frame, deviceSize }
    }

    case 'scroll': {
      const s = scrollStore.getState().get(metaData.id)
      return { ...s.layout, grabOffset, frameRect: frame, deviceSize }
    }
    default: throw new Error(`metaData.type error: ${metaData.type}`)
  }
}
/* =========================
  Build Data
========================= */

function buildCarouselData(metaData: DomMeta): (CarouselData) {
  const s = carouselStore.getState().get(metaData.id)
  const lockSwipeAt = { prev: metaData.lockPrevAt, next: metaData.lockNextAt }
  return { index: s.index, lockSwipeAt }
}
function buildSliderData(metaData: DomMeta): SliderData {
  const s = sliderStore.getState().get(metaData.id)
  return { constraints: s.constraints }
}
function buildDragData(metaData: DomMeta): DragData {
  const s = dragStore.getState().get(metaData.id)
  const snap = (metaData.snapX != null && metaData.snapY != null) ? { x: metaData.snapX, y: metaData.snapY } : undefined
  return { settledOffset: s.settledOffset, snap: snap, constraints: s.constraints }
}
function buildScrollData(metaData: DomMeta): ScrollData {
  const s = scrollStore.getState().get(metaData.id)
  const onEdgeDir = metaData.onEdgeDir != null ? metaData.onEdgeDir : undefined
  return { onEdgeDir, settledValue: s.settledValue, isVisible: s.isVisible }
}
/* =========================
    Build capabilities
  ========================= */
function buildCapabilities(metaData: DomMeta): Capabilities {
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

export const __TEST_ONLY_API = {
  buildCarousel,
  buildSlider,
  buildDrag,
  buildScroll,
  buildButton,
  buildBase,
  buildSwipeBase,
  buildLayout,
  buildCarouselData,
  buildSliderData,
  buildDragData,
  buildScrollData,
  buildCapabilities,
}
