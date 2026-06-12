import type { Delta, Vec2 } from '../../shared/typing/core.types.ts'

export interface CancelData {
  readonly element: HTMLElement
  pressCancel: boolean
}

export type Runtime = RuntimePress | RuntimeStart | RuntimeSwipe | RuntimePressRelease | RuntimeCommit

export type RuntimePress = Delta & {
  event: 'press'
}

export type RuntimeStart = Delta & {
  event: 'swipeStart'
  cancel?: CancelData
  thresholdValue: Vec2
}

export type RuntimeSwipe = Delta & {
  event: 'swipe'
}

export type RuntimePressRelease = Delta & {
  event: 'pressRelease'
}
export type RuntimeCommit = Delta & {
  event: 'swipeCommit' | 'swipeRevert'
}

export type RuntimeRevert = Delta & {
  event: 'swipeRevert'
}

// export type RuntimeCancelEffect = {
//   event: 'pressCancel'
// }