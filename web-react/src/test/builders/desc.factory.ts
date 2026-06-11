import type { ButtonDesc, CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types';
import { createBaseInteraction, createBaseWithAxis1D, createBaseWithAxis2D } from '@test/builders/base.factory';
import { createCarouselData, createDragData, createScrollData, createSliderData } from '@test/builders/data.factory';
import { createInstantCapabilities, createPressCapabilities, createSwipeCapabilities } from '@test/builders/capabilities.factory';
export function createButtonDesc(
  overrides: Partial<ButtonDesc> = {}): ButtonDesc {
  return {
    type: 'button',
    base: createBaseInteraction(overrides.base),
    capabilities: createPressCapabilities(overrides.capabilities)
  }
}
export function createCarouselDesc(
  overrides: Partial<CarouselDesc> = {}): CarouselDesc {
  return {
    type: 'carousel',
    base: createBaseWithAxis1D(overrides.base),
    data: createCarouselData(overrides.data),
    capabilities: createSwipeCapabilities(overrides.capabilities)
  }
}

export function createSliderDesc(
  overrides: Partial<SliderDesc> = {}): SliderDesc {
  return {
    type: 'slider',
    base: createBaseWithAxis1D(overrides.base),
    data: createSliderData(overrides.data),
    capabilities: createInstantCapabilities(overrides.capabilities)
  }
}
export function createScrollDesc(
  overrides: Partial<ScrollDesc> = {}): ScrollDesc {
  return {
    type: 'scroll',
    base: createBaseWithAxis1D(overrides.base),
    data: createScrollData(overrides.data),
    capabilities: createInstantCapabilities(overrides.capabilities)
  }
}
export function createDragDesc(
  overrides: Partial<DragDesc> = {}): DragDesc {
  return {
    type: 'drag',
    base: createBaseWithAxis2D(overrides.base),
    data: createDragData(overrides.data),
    capabilities: createSwipeCapabilities(overrides.capabilities)
  }
}