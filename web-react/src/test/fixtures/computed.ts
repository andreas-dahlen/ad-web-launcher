import type { ComputedPatch } from '@interaction/types/computed.types';

export function createComputedPatch(
  overrides: Partial<ComputedPatch> = {}
): ComputedPatch {
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