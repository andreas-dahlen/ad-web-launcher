// gestureTypeGuards.ts
import type { InteractionType, DataKeys } from '../types/gestures'

export function isGestureType(type: InteractionType | null): type is DataKeys {
  return type === "carousel" ||
         type === "slider" ||
         type === "drag"
}