import type { ScrollComputed, SliderComputed } from '@interaction/types/runtime/computed.types'
import { merge } from '@test/utils/factory.utils'
import { computed_DEFAULT } from '@test/app/interaction/fixtures/computed.fixture'

export function createComputedSlider(overrides?: Partial<SliderComputed>): SliderComputed {
  return merge(computed_DEFAULT.slider, overrides)
}
export function createComputedScroll(overrides?: Partial<ScrollComputed>): ScrollComputed {
  return merge(computed_DEFAULT.scroll, overrides)
}
