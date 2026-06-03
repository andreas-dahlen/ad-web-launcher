
import type { CarouselSolution, DragSolution, Runtime, ScrollSolution, SliderSolution } from '@interaction/types/Runtime.types';
import { createEl } from '@test/functions';

export function createRuntime(
  overrides: Partial<Runtime> = {}
): Runtime {
  return {
    event: "press",
    delta: { x: 10, y: 10 },
    cancel: { element: createEl(), pressCancel: true },
    thresholdValue: { x: 4, y: 5 },
    ...overrides
  }
}

export function createCarouselSolution(
  overrides: Partial<CarouselSolution> = {}
): CarouselSolution {
  return {
    storeAccepted: true,
    delta1D: 50,
    ...overrides
  }
}

export function createSliderSolution(
  overrides: Partial<SliderSolution> = {}
): SliderSolution {
  return {
    storeAccepted: true,
    delta1D: 50,
    ...overrides
  }
}

export function createScrollSolution(
  overrides: Partial<ScrollSolution> = {}
): ScrollSolution {
  return {
    storeAccepted: true,
    ...overrides
  }
}

export function createDragSolution(
  overrides: Partial<DragSolution> = {}
): DragSolution {
  return {
    storeAccepted: true,
    delta: { x: 50, y: 50 },
    ...overrides
  }
}
