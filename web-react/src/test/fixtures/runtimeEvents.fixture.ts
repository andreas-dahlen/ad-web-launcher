import type { RuntimePress, RuntimePressRelease, RuntimeRevert, RuntimeSwipe, RuntimeCommit, RuntimeStart } from '@interaction/types/runtime.types'
import { createEl } from '@test/builders/domAndMeta.factory'

export const event_DEFAULT: {
  press: RuntimePress
  swipeStart: RuntimeStart
  swipe: RuntimeSwipe
  pressRelease: RuntimePressRelease
  swipeCommit: RuntimeCommit
  swipeRevert: RuntimeRevert
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