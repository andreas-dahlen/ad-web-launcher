// gestureTypeGuards.ts
export function isGestureType(type: InteractionType | null): type is DataKeys {
  return type === "carousel" ||
         type === "slider" ||
         type === "drag"
}

export function isStateFn2Arg(fnName: string): fnName is StateFn2Arg {
  return ['press', 'swipeStart', 'swipe', 'swipeCommit', 'swipeRevert'].includes(fnName)
}