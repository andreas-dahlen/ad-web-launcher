
import type { BaseInteraction, LayoutData } from '@interaction/types/base.types'
import type { RuntimePress, RuntimePressRelease, RuntimeRevertOverride, RuntimeSwipe, RuntimeSwipeCommit, RuntimeSwipeStart } from '@interaction/types/runtime.types'
import { createEl } from '@test/functions.debug'

export const computed_DEFAULT = {
  slider: {
    sliderStartOffset: 30,
    sliderValuePerPixel: 3,
  },
  scroll: {
    isOverflow: true,
    startOverflowValue: 10,
  }
} as const

export const data_DEFAULT = {
  carousel: {
    index: 3, lockSwipeAt: { prev: 0, next: 5 }
  },
  drag: {
    settledOffset: { x: 0, y: 0 },
    constraints: {
      minX: 0,
      maxX: 100,
      minY: 0,
      maxY: 100
    },
    snap: { x: 100, y: 100 },
  },
  slider: {
    constraints: { min: 0, max: 99 }
  },
  scroll: {
    settledValue: 0,
    isVisible: true,
    onEdgeDir: 'up'
  }
} as const

export const base_DEFAULT: {
  base: BaseInteraction
  layout: LayoutData
} = {
  base: {
    pointerId: 1,
    element: createEl(),
    id: 'test'
  },
  layout: {
    deviceSize: { width: 100, height: 100 },
    frameRect: { left: 50, top: 50, width: 100, height: 100 },
    grabOffset: { x: 10, y: 10 },
    containerSize: { width: 100, height: 100 },
    itemSize: { width: 10, height: 10 }
  }
}

export const baseSwipe_DEFAULT = {
  ...base_DEFAULT.base,
  layout: base_DEFAULT.layout,
}

export const capabilities_DEFAULT = {
  press: {
    pressable: true,
    swipeable: false,
    instantSwipe: false
  },
  swipe: {
    pressable: true,
    swipeable: true,
    instantSwipe: false
  },
  instant: {
    pressable: false,
    swipeable: true,
    instantSwipe: true
  } //swipeable false nad ressable false to ensure instant overrides
} as const

export const event_DEFAULT: {
  press: RuntimePress
  swipeStart: RuntimeSwipeStart
  swipe: RuntimeSwipe
  pressRelease: RuntimePressRelease
  swipeCommit: RuntimeSwipeCommit
  swipeRevert: RuntimeRevertOverride
} = {
  press: {
    event: "press",
    delta: { x: 0, y: 0 }
  },
  swipeStart: {
    event: "swipeStart",
    cancel: { element: createEl(), pressCancel: true },
    thresholdValue: { x: 100, y: 0 },
    delta: { x: 100, y: 0 }

  },
  swipe: {
    event: "swipe",
    delta: { x: 100, y: 0 }
  },
  pressRelease: {
    event: "pressRelease",
    delta: { x: 0, y: 0 }
  },
  swipeCommit: {
    event: "swipeCommit",
    delta: { x: 100, y: 0 }
  },
  swipeRevert: {
    event: 'swipeRevert',
    delta: { x: 0, y: 0 }
  }
}