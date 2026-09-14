import type { ScrollComputed, SliderComputed } from '@interaction/types/runtime/computed.types.ts'
import { merge } from '@test/testUtils/factory.utils.ts'
import { computed_DEFAULT } from '@test/app/interaction/fixtures/computed.fixture.ts'

export function createComputedSlider(overrides?: Partial<SliderComputed>): SliderComputed {
  return merge(computed_DEFAULT.slider, overrides)
}
export function createComputedScroll(overrides?: Partial<ScrollComputed>): ScrollComputed {
  return merge(computed_DEFAULT.scroll, overrides)
}
