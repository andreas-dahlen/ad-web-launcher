import type { CtxBase, CtxBaseSwipe, CtxButton, CtxCarousel, CtxDrag, CtxScroll, CtxSlider } from '@interaction/types/ctx.types';
import type { GestureUpdate } from '@interaction/types/data.types';
import { createMetaEl } from '@test/functions';

export function createGestureUpdate(
  overrides: Partial<GestureUpdate> = {}
): GestureUpdate {
  return {
    pointerId: 1,
    //slider
    sliderStartOffset: 30,
    sliderValuePerPixel: 3,
    //scroll
    isOverflow: true,
    startOverflowValue: 10,
    ...overrides
  }
}

export function createCtxBase(
  overrides: Partial<CtxBase> = {}
): CtxBase {
  return {
    event: "swipeStart",
    id: "test",
    element: createMetaEl(),
    ...overrides
  }
}

export function createCtxSwipe(
  overrides: Partial<CtxBaseSwipe> = {}
): CtxBaseSwipe {
  return {
    ...createCtxBase(),
    storeAccepted: true,
    delta: { x: 40, y: 50 },
    cancel: { element: createMetaEl(), pressCancel: true },
    thresholdValue: { x: 4, y: 5 },
    ...overrides
  }
}

export function createCtxButton(
  overrides: Partial<CtxButton> = {}
): CtxButton {
  return {
    type: "button",
    event: 'press',
    id: "test",
    element: createMetaEl(),
    ...overrides
  }
}

export function createCtxCarousel(
  overrides: Partial<CtxCarousel> = {}
): CtxCarousel {
  return {
    type: "carousel",
    ...createCtxSwipe(),
    delta1D: 30,
    direction: { axis: "vertical", dir: "up" },
    ...overrides
  }
}
export function createCtxSlider(
  overrides: Partial<CtxSlider> = {}
): CtxSlider {
  return {
    ...createCtxSwipe(),
    id: "test",
    type: "slider",
    event: "swipe",
    storeAccepted: true,
    delta: { x: 30, y: 30 },
    element: createMetaEl(),
    delta1D: 30,
    gestureUpdate: createGestureUpdate(),
    ...overrides
  }
}
export function createCtxScroll(
  overrides: Partial<CtxScroll> = {}
): CtxScroll {
  return {
    ...createCtxSwipe(),
    id: "test",
    type: "scroll",
    event: "swipe",
    delta1D: 30,
    storeAccepted: true,
    delta: { x: 30, y: 30 },
    element: createMetaEl(),
    overflowValue: 30,
    isVisible: true,
    gestureUpdate: createGestureUpdate(),
    ...overrides
  }
}
export function createCtxDrag(
  overrides: Partial<CtxDrag> = {}
): CtxDrag {
  return {
    ...createCtxSwipe(),
    type: "drag",
    id: "test",
    delta: { x: 40, y: 50 },
    storeAccepted: true,
    element: createMetaEl(),
    event: "swipe",
    ...overrides
  }
}