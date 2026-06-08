import type { delta, Vec2 } from '../../shared/typing/core.types.ts'

export interface CancelData {
  readonly element: HTMLElement
  pressCancel: boolean
}

export type Runtime = RuntimePress | RuntimeSwipeStart | RuntimeSwipe | RuntimePressRelease | RuntimeSwipeCommit

export type RuntimePress = delta & {
  event: 'press'
}

export type RuntimeSwipeStart = delta & {
  event: 'swipeStart'
  cancel?: CancelData
  thresholdValue: Vec2
}

export type RuntimeSwipe = delta & {
  event: 'swipe'
}

export type RuntimePressRelease = delta & {
  event: 'pressRelease'
}
export type RuntimeSwipeCommit = delta & {
  event: 'swipeCommit' | 'swipeRevert'
}

export type RuntimeRevertOverride = delta & {
  event: 'swipeRevert'
}

export type RuntimeCancelEffect = {
  event: 'pressCancel'
}