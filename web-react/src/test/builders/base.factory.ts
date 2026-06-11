import type { BaseInteraction, BaseWithAxis1D, BaseWithAxis2D, BaseWithSwipe, LayoutData } from '@interaction/types/base.types';
import { base_DEFAULT, baseSwipe_DEFAULT } from '@test/defaults/desc.defaults';
import { merge } from '@test/builders/factory.utils';

export function createBaseInteraction(overrides: Partial<BaseInteraction> = {}): BaseInteraction {
  return merge(base_DEFAULT.base, overrides)
}

export function createLayout(overrides: Partial<LayoutData> = {}): LayoutData {
  return merge(base_DEFAULT.layout, overrides)
}


export function createBaseSwipe(
  overrides: Partial<BaseWithSwipe> = {}): BaseWithSwipe {
  return merge(baseSwipe_DEFAULT, overrides)
}

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
