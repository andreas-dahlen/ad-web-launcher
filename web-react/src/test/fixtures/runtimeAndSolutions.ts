
import type { CarouselSolution, DragSolution, Runtime, ScrollSolution, SliderSolution } from '@interaction/types/Runtime.types';
import { createEl } from '@test/functions';

export function createRuntime(
  overrides: Partial<Runtime> = {}
): Runtime {
  return {
    event: "press",
    delta: { x: 10, y: 10 },
    cancel: { element: createEl(), pressCancel: true },
    thresholdValue: { x: 4, y: 5 },
    ...overrides
  }
}

export function createCarouselSolution(
  overrides: Partial<CarouselSolution> = {}
): CarouselSolution {
  return {
    storeAccepted: true,
    delta1D: 50,
    ...overrides
  }
}

export function createSliderSolution(
  overrides: Partial<SliderSolution> = {}
): SliderSolution {
  return {
    storeAccepted: true,
    delta1D: 50,
    ...overrides
  }
}

export function createScrollSolution(
  overrides: Partial<ScrollSolution> = {}
): ScrollSolution {
  return {
    storeAccepted: true,
    ...overrides
  }
}

export function createDragSolution(
  overrides: Partial<DragSolution> = {}
): DragSolution {
  return {
    storeAccepted: true,
    delta: { x: 50, y: 50 },
    ...overrides
  }
}




// export function createCtxSwipe(
//   overrides: Partial<CtxBaseSwipe> = {}
// ): CtxBaseSwipe {
//   return {
//     ...createCtxBase(),
//     event: "swipe",
//     storeAccepted: false,
//     delta: { x: 40, y: 50 },
//     cancel: { element: createEl(), pressCancel: true },
//     thresholdValue: { x: 4, y: 5 },
//     ...overrides
//   }
// }
// export function createCtxButton(
//   overrides: Partial<CtxButton> = {}
// ): CtxButton {
//   return {
//     ...createCtxBase(),
//     type: "button",
//     ...overrides
//   }
// }


// export function createCtxCarousel(
//   overrides: Partial<CtxCarousel> = {}
// ): CtxCarousel {
//   return {
//     ...createCtxSwipe(),
//     type: "carousel",
//     delta1D: 30,
//     direction: { axis: "vertical", dir: "up" },
//     ...overrides
//   }
// }
// export function createCtxSlider(
//   overrides: Partial<CtxSlider> = {}
// ): CtxSlider {
//   return {
//     ...createCtxSwipe(),
//     type: "slider",
//     delta1D: 30,
//     gestureUpdate: createGestureUpdate(),
//     ...overrides
//   }
// }
// export function createCtxScroll(
//   overrides: Partial<CtxScroll> = {}
// ): CtxScroll {
//   return {
//     ...createCtxSwipe(),
//     type: "scroll",
//     delta1D: 30,
//     overflowValue: 30,
//     isVisible: true,
//     gestureUpdate: createGestureUpdate(),
//     ...overrides
//   }
// }
// export function createCtxDrag(
//   overrides: Partial<CtxDrag> = {}
// ): CtxDrag {
//   return {
//     ...createCtxSwipe(),
//     type: "drag",
//     ...overrides
//   }
// }