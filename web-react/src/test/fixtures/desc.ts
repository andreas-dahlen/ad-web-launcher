import type { ButtonDesc, CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types';
import { createBaseInteraction, createBaseSwipe } from '@test/fixtures/base';
import { createCtxButton, createCtxCarousel, createCtxDrag, createCtxScroll, createCtxSlider } from '@test/fixtures/ctx';
import { createCarouselData, createDragData, createScrollData, createSliderData } from '@test/fixtures/data';

export function createButtonDesc(
  overrides: Partial<ButtonDesc> = {}): { type: 'button' } & ButtonDesc {
  return {
    type: 'button',
    base: {
      ...createBaseInteraction(),
      ...overrides.base
    },
    capabilities: {
      pressable: true,
      swipeable: false,
      instantSwipe: false,
      ...overrides.capabilities
    },
    ctx: {
      ...createCtxButton(),
      ...overrides.ctx
    }
  }
}
export function createCarouselDesc(
  overrides: Partial<CarouselDesc> = {}): { type: 'carousel' } & CarouselDesc {
  return {
    type: 'carousel',
    base: {
      ...createBaseSwipe(),
      axis: 'horizontal',
      ...overrides.base
    },
    data: {
      ...createCarouselData(),
      ...overrides.data
    },
    capabilities: {
      pressable: true,
      swipeable: true,
      instantSwipe: false,
      ...overrides.capabilities
    },
    ctx: {
      ...createCtxCarousel(),
      ...overrides.ctx
    }
  }
}

export function createSliderDesc(
  overrides: Partial<SliderDesc> = {}): { type: 'slider' } & SliderDesc {
  return {
    type: 'slider',
    base: {
      ...createBaseSwipe(),
      axis: 'horizontal',
      ...overrides.base
    },
    data: {
      ...createSliderData(),
      ...overrides.data
    },
    capabilities: {
      pressable: true,
      swipeable: true,
      instantSwipe: true,
      ...overrides.capabilities
    },
    ctx: {
      ...createCtxSlider(),
      ...overrides.ctx
    }
  }
}
export function createScrollDesc(
  overrides: Partial<ScrollDesc> = {}): { type: 'scroll' } & ScrollDesc {
  return {
    type: 'scroll',
    base: {
      ...createBaseSwipe(),
      axis: 'vertical',
      ...overrides.base
    },
    data: {
      ...createScrollData(),
      ...overrides.data
    },
    capabilities: {
      pressable: true,
      swipeable: true,
      instantSwipe: true,
      ...overrides.capabilities
    },
    ctx: {
      ...createCtxScroll(),
      ...overrides.ctx
    }
  }
}
export function createDragDesc(
  overrides: Partial<DragDesc> = {}): { type: 'drag' } & DragDesc {
  return {
    type: 'drag',
    base: {
      ...createBaseSwipe(),
      axis: "both",
      ...overrides.base
    },
    data: {
      ...createDragData(),
      ...overrides.data
    },
    capabilities: {
      pressable: true,
      swipeable: true,
      instantSwipe: false,
      ...overrides.capabilities
    },
    ctx: {
      ...createCtxDrag(),
      ...overrides.ctx
    }
  }
}