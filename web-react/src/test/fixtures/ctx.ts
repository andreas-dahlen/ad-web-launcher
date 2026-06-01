import type { CtxBase, CtxBaseSwipe, CtxButton, CtxCarousel, CtxDrag, CtxScroll, CtxSlider } from '@interaction/types/ctx.types';
import type { GestureUpdate } from '@interaction/types/data.types';
import { createEl, createElByType } from '@test/functions';

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
    event: "press",
    id: "test",
    element: createEl(),
    ...overrides
  }
}

export function createCtxSwipe(
  overrides: Partial<CtxBaseSwipe> = {}
): CtxBaseSwipe {
  return {
    ...createCtxBase(),
    event: "swipe",
    storeAccepted: false,
    delta: { x: 40, y: 50 },
    cancel: { element: createEl(), pressCancel: true },
    thresholdValue: { x: 4, y: 5 },
    ...overrides
  }
}
export function createCtxButton(
  overrides: Partial<CtxButton> = {}
): CtxButton {
  return {
    ...createCtxBase(),
    type: "button",
    element: createElByType('button'),
    ...overrides
  }
}


export function createCtxCarousel(
  overrides: Partial<CtxCarousel> = {}
): CtxCarousel {
  return {
    ...createCtxSwipe(),
    type: "carousel",
    element: createElByType('carousel'),
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
    type: "slider",
    element: createElByType('slider'),
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
    type: "scroll",
    element: createElByType('scroll'),
    delta1D: 30,
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
    element: createElByType('drag'),
    ...overrides
  }
}