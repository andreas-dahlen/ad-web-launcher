import type { Delta, Vec2 } from '../../../shared/types/core.types.ts'

type CancelData = {
  readonly element: HTMLElement
  pressCancel: boolean
}

export type Runtime = RuntimePress | RuntimeStart | RuntimeSwipe | RuntimePressRelease | RuntimeCommit

type GestureState = {
  isLongPress: boolean
}

export type RuntimePress = Delta & {
  event: 'press'
  isLongPress: false
}

export type RuntimeStart = Delta & GestureState & {
  event: 'swipeStart'
  cancel?: CancelData
  thresholdValue: Vec2
}

export type RuntimeSwipe = Delta & GestureState & {
  event: 'swipe'
}

export type RuntimePressRelease = Delta & GestureState & {
  event: 'pressRelease'
}
export type RuntimeCommit = Delta & GestureState & {
  event: 'swipeCommit' | 'swipeRevert'
}



// export type RuntimeCancelEffect = {
//   event: 'pressCancel'
// }