import type { CarouselData, CarouselModifiers, DragData, DragModifiers, ScrollData, SliderData } from '@interaction/types/data.types';

export function createCarouselData(
  overrides: Partial<CarouselData> = {}
): CarouselData & CarouselModifiers {
  return {
    index: 3,
    sceneSize: { width: 100, height: 100 },
    lockSwipeAt: { prev: 0, next: 3 },
    ...overrides
  }
}


export function createDragData(
  overrides: Partial<DragData> = {}
): DragData & DragModifiers {
  return {
    settledOffset: { x: 0, y: 0 },
    layout: {
      deviceSize: { width: 100, height: 100 },
      containerSize: { width: 100, height: 100 },
      itemSize: { width: 100, height: 100 },
      constraints: { minX: 0, minY: 0, maxX: 100, maxY: 100 }
    },
    snap: { x: 10, y: 10 },
    locked: false,
    ...overrides,
  }
}


export function createSliderData(
  overrides: Partial<SliderData> = {}): SliderData {
  return {
    thumbSize: { width: 100, height: 100 },
    constraints: { min: 0, max: 150 },
    containerSize: { width: 200, height: 200 },
    ...overrides
  }
}


export function createScrollData(
  overrides: Partial<ScrollData> = {}): ScrollData {
  return {
    settledValue: 0,
    containerSize: { width: 100, height: 100 },
    contentSize: { width: 100, height: 100 },
    isVisible: true,
    onEdgeDir: 'up',
    ...overrides
  }
}

