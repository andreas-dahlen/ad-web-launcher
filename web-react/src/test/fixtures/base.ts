import type { BaseInteraction, BaseWithSwipe } from '@interaction/types/base.types';
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
    axis: 'both',
    grabOffset: { x: 0, y: 0 },
    frame: { left: 0, top: 0, width: 100, height: 100 },
    ...overrides,
  }
}