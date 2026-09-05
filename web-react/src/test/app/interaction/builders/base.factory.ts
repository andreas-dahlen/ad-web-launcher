import type { BaseInteraction, BaseWithAxis1D, BaseWithAxis2D } from '@interaction/types/descriptor/base.types.ts';
import { merge } from '@test/testUtils/factory.utils.ts';
import { base_DEFAULT, baseSwipe_DEFAULT } from '@test/app/interaction/fixtures/base.fixture.ts';

export function createBaseInteraction(overrides: Partial<BaseInteraction> = {}): BaseInteraction {
  return merge(base_DEFAULT.base, overrides)
}

// export function createLayout(overrides: Partial<LayoutData> = {}): LayoutData {
//   return merge(base_DEFAULT.layout, overrides)
// }


// export function createBaseSwipe(
//   overrides: Partial<BaseWithSwipe> = {}): BaseWithSwipe {
//   return merge(baseSwipe_DEFAULT, overrides)
// }

export function createBaseWithAxis1D(
  overrides: Partial<BaseWithAxis1D> = {}
): BaseWithAxis1D {
  return merge({
    ...baseSwipe_DEFAULT,
    axis: 'horizontal'
  }, overrides)
}

export function createBaseWithAxis2D(
  overrides: Partial<BaseWithAxis2D> = {}
): BaseWithAxis2D {
  return merge({
    ...baseSwipe_DEFAULT,
    axis: 'both'
  }, overrides)
}
