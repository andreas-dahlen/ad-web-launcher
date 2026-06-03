import type { BaseInteraction, BaseWithAxis1D, BaseWithAxis2D, BaseWithSwipe } from '@interaction/types/base.types';
import { createEl } from '@test/functions';

export function createBaseInteraction(
  overrides: Partial<BaseInteraction> = {}
): BaseInteraction {
  return {
    pointerId: 1,
    element: createEl(),
    id: 'test',
    ...overrides,
  }
}

export function createBaseSwipe(
  overrides: Partial<BaseWithSwipe> = {}
): BaseWithSwipe {
  return {
    ...createBaseInteraction(),
    grabOffset: { x: 0, y: 0 },
    frame: { left: 0, top: 0, width: 100, height: 100 },
    ...overrides,
  }
}

export function createBaseWithAxis1D(
  overrides: Partial<BaseWithAxis1D> = {}
): BaseWithAxis1D {
  return {
    ...createBaseSwipe(),
    axis: "vertical",
    ...overrides
  }
}

export function createBaseWithAxis2D(
  overrides: Partial<BaseWithAxis2D> = {}
): BaseWithAxis2D {
  return {
    ...createBaseSwipe(),
    axis: "both",
    ...overrides
  }
}