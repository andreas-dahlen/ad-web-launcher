import { domQuery } from './domQuery.ts'
import { carouselStore } from '@primitives/Carousel/store/carousel.store.ts'
import { dragStore } from '@primitives/Drag/store/drag.store.ts'
import { sliderStore } from '@primitives/Slider/store/slider.store.ts'
import { scrollStore } from '@primitives/Scroll/store/scroll.store.ts'
import { sizeStore } from '../../shared/state/stores/size.store.ts'
import type { BaseInteraction, DomMeta, Capabilities, BaseWithSwipe, LayoutData } from '../types/descriptor/base.types.ts'
import type { CarouselData, DragData, ScrollData, SliderData } from '../types/descriptor/data.types.ts'
import type { CarouselDesc, SliderDesc, DragDesc, ButtonDesc, ScrollDesc, Descriptor } from '../types/descriptor/descriptor.types.ts'

interface Builder {
  capabilities: Capabilities
  x: number
  y: number
  pointerId: number
}
/* =========================
Entry point and Type descrimination
========================= */
export function compileDescriptor(x: number, y: number, pointerId: number, metadata: DomMeta): Descriptor | null {
  const capabilities = buildCapabilities(metadata)
  const r = { capabilities, x, y, pointerId }
  switch (metadata.type) {
    case 'carousel': {
      const desc = buildCarousel(metadata, r)
      if (desc) return desc
      return null
    }
    case 'slider': {
      const desc = buildSlider(metadata, r)
      if (desc) return desc
      return null
    }
    case 'drag': {
      const desc = buildDrag(metadata, r)
      if (desc) return desc
      return null
    }
    case 'scroll': {
      const desc = buildScroll(metadata, r)
      if (desc) return desc
      return null
    }
    case 'button': {
      return buildButton(metadata, r)
    }
    default: return null
  }
}



function buildCarousel(metadata: DomMeta, r: Builder): CarouselDesc | null {
  if (!metadata.axis || metadata.axis === 'both') return null
  const data = buildCarouselData(metadata)
  return {
    type: 'carousel',
    base: { ...buildSwipeBase(metadata, r), axis: metadata.axis },
    data: data,
    capabilities: r.capabilities
  }
}
function buildSlider(metadata: DomMeta, r: Builder): SliderDesc | null {
  if (!metadata.axis || metadata.axis === 'both') return null
  const data = buildSliderData(metadata)
  return {
    type: 'slider',
    base: { ...buildSwipeBase(metadata, r), axis: metadata.axis },
    data: data,
    capabilities: r.capabilities
  }
}
function buildDrag(metadata: DomMeta, r: Builder): DragDesc | null {
  if (!metadata.axis || metadata.axis !== 'both') return null
  const data = buildDragData(metadata)
  return {
    type: 'drag',
    base: { ...buildSwipeBase(metadata, r), axis: metadata.axis },
    data: data,
    capabilities: r.capabilities
  }
}
function buildScroll(metadata: DomMeta, r: Builder): ScrollDesc | null {
  if (!metadata.axis || metadata.axis === 'both') return null
  const data = buildScrollData(metadata)
  if (data) return {
    type: 'scroll',
    base: { ...buildSwipeBase(metadata, r), axis: metadata.axis },
    data: data,
    capabilities: r.capabilities
  }
  return null
}

function buildButton(metadata: DomMeta, r: Builder): ButtonDesc {
  return {
    type: 'button',
    base: buildBase(metadata, r.pointerId),
    capabilities: r.capabilities
  }
}

/* =========================
    Build Base
  ========================= */
function buildBase(metadata: DomMeta, pointerId: number): BaseInteraction {
  return {
    pointerId: pointerId,
    element: metadata.el,
    id: metadata.id,
    actionId: metadata.ds.action ?? undefined,
  }
}

function buildSwipeBase(metadata: DomMeta, r: Builder): BaseWithSwipe {
  const base = buildBase(metadata, r.pointerId)
  const layout = buildLayout(metadata, r)
  return {
    ...base,
    layout: layout
  }
}

function buildLayout(metadata: DomMeta, r: Builder): LayoutData {
  const d = sizeStore.getState().device
  const deviceSize = { width: d.width, height: d.height }
  const { grabOffset, frame } = domQuery.getElSnapshot(r.x, r.y, metadata.el)
  switch (metadata.type) {
    case 'carousel': {
      const s = carouselStore.getState().get(metadata.id)
      return { ...s.layout, grabOffset, frameRect: frame, deviceSize }
    }
    case 'slider': {
      const s = sliderStore.getState().get(metadata.id)
      return { ...s.layout, grabOffset, frameRect: frame, deviceSize }
    }

    case 'drag': {
      const s = dragStore.getState().get(metadata.id)
      return { ...s?.layout, grabOffset, frameRect: frame, deviceSize }
    }

    case 'scroll': {
      const s = scrollStore.getState().get(metadata.id)
      return { ...s.layout, grabOffset, frameRect: frame, deviceSize }
    }
    default: throw new Error(`metadata.type error: ${metadata.type}`)
  }
}
/* =========================
  Build Data
========================= */

//TODO expose a store API that gives a specific selection of exposed getters. Not the whole Store..
function buildCarouselData(metadata: DomMeta): (CarouselData) {
  const currentScene = carouselStore.getState().getCurrentScene(metadata.id)
  const lockSwipeAt = { prev: metadata.lockPrevAt, next: metadata.lockNextAt }
  return { currentScene: currentScene ?? 0, lockSwipeAt }
}
function buildSliderData(metadata: DomMeta): SliderData {
  const s = sliderStore.getState().get(metadata.id)
  return { constraints: s.constraints }
}
function buildDragData(metadata: DomMeta): DragData {
  const s = dragStore.getState().get(metadata.id)
  const snap = (metadata.snapX != null && metadata.snapY != null) ? { x: metadata.snapX, y: metadata.snapY } : undefined
  return { settledOffset: s.settledOffset, snap: snap, constraints: s.constraints }
}
function buildScrollData(metadata: DomMeta): ScrollData {
  const s = scrollStore.getState().get(metadata.id)
  const overflowSide = metadata.overflowSide ?? undefined
  return { overflowSide, settledValue: s.settledValue, isVisible: s.isVisible }
}
/* =========================
    Build capabilities
  ========================= */
function buildCapabilities(metadata: DomMeta): Capabilities {
  const { ds, isPressable, isSwipeable, isInstantSwipe } = metadata

  const pressConfirm =
    isPressable ||
    ds.action !== undefined

  return {
    isPressable: pressConfirm,
    isSwipeable,
    isInstantSwipe
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
