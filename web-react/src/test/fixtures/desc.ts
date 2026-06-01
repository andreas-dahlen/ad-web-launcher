import type { ButtonDesc, CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types';
import { createBaseInteraction, createBaseSwipe } from '@test/fixtures/base';
import { createCtxButton, createCtxCarousel, createCtxDrag, createCtxScroll, createCtxSlider } from '@test/fixtures/ctx';
import { createCarouselData, createDragData, createScrollData, createSliderData } from '@test/fixtures/data';

export function createButtonDesc(
  overrides: Partial<ButtonDesc> = {}): ButtonDesc {
  return {
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
  overrides: Partial<CarouselDesc> = {}): CarouselDesc {
  return {
    base: {
      ...createBaseSwipe(),
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
  overrides: Partial<SliderDesc> = {}): SliderDesc {
  return {
    base: {
      ...createBaseSwipe(),
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
  overrides: Partial<ScrollDesc> = {}): ScrollDesc {
  return {
    base: {
      ...createBaseSwipe(),
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
  overrides: Partial<DragDesc> = {}): DragDesc {
  return {
    base: {
      ...createBaseSwipe(),
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