import type { CarouselData, DragData, ScrollData, SliderData } from '@interaction/types/descriptor/data.types.ts';
import { merge } from '@test/testUtils/factory.utils.ts';
import { data_DEFAULT } from '@test/app/interaction/fixtures/data.fixture.ts';

export function createCarouselData(
  overrides: Partial<CarouselData> = {}): CarouselData {
  return merge(data_DEFAULT.carousel, overrides)
}

export function createDragData(overrides: Partial<DragData> = {}): DragData {
  return merge(data_DEFAULT.drag, overrides)
}

export function createSliderData(overrides: Partial<SliderData> = {}): SliderData {
  return merge(data_DEFAULT.slider, overrides)
}

export function createScrollData(overrides: Partial<ScrollData> = {}): ScrollData {
  return merge(data_DEFAULT.scroll, overrides)
}

