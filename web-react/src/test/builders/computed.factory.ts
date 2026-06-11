import type { ScrollComputed, SliderComputed } from '@interaction/types/computed.types'
import { merge } from '@test/builders/factory.utils'
import { computed_DEFAULT } from '@test/defaults/desc.defaults'

export function createComputedSlider(overrides?: Partial<SliderComputed>): SliderComputed {
  return merge(computed_DEFAULT.slider, overrides)
}
export function createComputedScroll(overrides?: Partial<ScrollComputed>): ScrollComputed {
  return merge(computed_DEFAULT.scroll, overrides)
}
