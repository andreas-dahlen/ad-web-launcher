import type { RuntimePress, RuntimePressRelease, RuntimeSwipe, RuntimeCommit, RuntimeStart } from '@interaction/types/runtime/runtime.types.ts'
import { createEl } from '@test/app/interaction/builders/domAndMeta.factory.ts'

export const event_DEFAULT: {
  press: RuntimePress
  swipeStart: RuntimeStart
  swipe: RuntimeSwipe
  pressRelease: RuntimePressRelease
  swipeCommit: RuntimeCommit
  swipeRevert: RuntimeCommit
} = {
  press: {
    event: "press",
    delta: { x: 0, y: 0 },
    isLongPress: false
  },
  swipeStart: {
    event: "swipeStart",
    cancel: { element: createEl(), pressCancel: true },
    thresholdValue: { x: 100, y: 0 },
    delta: { x: 100, y: 0 },
    isLongPress: true

  },
  swipe: {
    event: "swipe",
    delta: { x: 100, y: 0 },
    isLongPress: true
  },
  pressRelease: {
    event: "pressRelease",
    delta: { x: 0, y: 0 },
    isLongPress: true
  },
  swipeCommit: {
    event: "swipeCommit",
    delta: { x: 100, y: 0 },
    isLongPress: true
  },
  swipeRevert: {
    event: 'swipeRevert',
    delta: { x: 0, y: 0 },
    isLongPress: true
  }
}