import type { ButtonDesc, CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types';
import { createBaseInteraction, createBaseWithAxis1D, createBaseWithAxis2D } from '@test/fixtures/base.fixture';
import { createCarouselData, createDragData, createScrollData, createSliderData } from '@test/fixtures/data.fixture';
export function createButtonDesc(
  overrides: Partial<ButtonDesc> = {}): ButtonDesc {
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
    }
  }
}
export function createCarouselDesc(
  overrides: Partial<CarouselDesc> = {}): CarouselDesc {
  return {
    type: 'carousel',
    base: {
      ...createBaseWithAxis1D(),
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
    }
  }
}

export function createSliderDesc(
  overrides: Partial<SliderDesc> = {}): SliderDesc {
  return {
    type: 'slider',
    base: {
      ...createBaseWithAxis1D(),
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
    }
  }
}
export function createScrollDesc(
  overrides: Partial<ScrollDesc> = {}): ScrollDesc {
  return {
    type: 'scroll',
    base: {
      ...createBaseWithAxis1D(),
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
    }
  }
}
export function createDragDesc(
  overrides: Partial<DragDesc> = {}): DragDesc {
  return {
    type: 'drag',
    base: {
      ...createBaseWithAxis2D(),
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
    }
  }
}