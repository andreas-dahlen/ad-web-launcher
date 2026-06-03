import type { Computed, ComputedPatch } from '@interaction/types/computed.types';

export function createComputed(
  overrides: Partial<Computed> = {}
): Computed {
  return {
    //slider
    sliderStartOffset: 30,
    sliderValuePerPixel: 3,
    //scroll
    isOverflow: true,
    startOverflowValue: 10,
    ...overrides
  }
}

export function createComputedPatch(
  overrides: Partial<ComputedPatch> = {}
): ComputedPatch {
  return {
    pointerId: 1,
    ...overrides
  }
}