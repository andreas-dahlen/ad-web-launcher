import { createButtonDesc, createCarouselDesc, createDragDesc, createScrollDesc, createSliderDesc } from '@test/builders/desc.factory'
import type { DescriptorMap, DescriptorSwipeMap, InterpreterPressOverrides, InterpreterPressReleaseOverrides, InterpreterSwipeCommitOverrides, InterpreterSwipeOverrides, InterpreterSwipeStartOverrides, SwipeTypeMap, TypeMap } from '@test/override.types'
import type { InterpreterPress, InterpreterPressRelease, InterpreterSwipe, InterpreterSwipeCommit, InterpreterSwipeStart, SwipingSession } from '@interaction/types/runtime/interpreter.types'
import { createRuntimePress, createRuntimePressRelease, createRuntimeSwipe, createRuntimeSwipeCommit, createRuntimeswipeStart } from '@test/builders/runtime.factory'
import { modifyGestureForTests } from '@interaction/input/interpreter'
import { createComputedSlider } from '@test/builders/computed.factory'

const typeMap: TypeMap = {
  carousel: createCarouselDesc,
  slider: createSliderDesc,
  scroll: createScrollDesc,
  drag: createDragDesc,
  button: createButtonDesc,
} as const

const swipeTypeMap: SwipeTypeMap = {
  carousel: createCarouselDesc,
  slider: createSliderDesc,
  scroll: createScrollDesc,
  drag: createDragDesc
} as const

export function createDesc<T extends keyof DescriptorMap>(
  type: T,
  overrides?: Partial<DescriptorMap[T]>
): DescriptorMap[T] {
  return typeMap[type](overrides)
}

function createSwipeDesc<T extends keyof DescriptorSwipeMap>(
  type: T,
  overrides?: Partial<DescriptorSwipeMap[T]>
): DescriptorSwipeMap[T] {
  return swipeTypeMap[type](overrides)
}

export function createInterpreterPress<T extends keyof DescriptorMap>(
  type: T,
  overrides: InterpreterPressOverrides<T> = {}
): InterpreterPress {
  return {
    runtime: createRuntimePress(overrides.runtime),
    desc: createDesc(type, overrides.desc),
    computed: overrides.computed ?? null
  }
}
export function createInterpreterPressRelease<T extends keyof DescriptorMap>(
  type: T,
  overrides: InterpreterPressReleaseOverrides<T> = {}
): InterpreterPressRelease {
  return {
    runtime: createRuntimePressRelease(overrides.runtime),
    desc: createDesc(type, overrides.desc),
    computed: overrides.computed ?? null
  }
}




export function createInterpreterSwipeStart<T extends keyof DescriptorSwipeMap>(
  type: T,
  overrides: InterpreterSwipeStartOverrides<T> = {}
): InterpreterSwipeStart {
  return {
    runtime: createRuntimeswipeStart(overrides.runtime),
    desc: createSwipeDesc(type, overrides.desc),
    computed: overrides.computed ?? null
  }
}
export function createInterpreterSwipe<T extends keyof DescriptorSwipeMap>(
  type: T,
  overrides: InterpreterSwipeOverrides<T> = {}
): InterpreterSwipe {
  return {
    runtime: createRuntimeSwipe(overrides.runtime),
    desc: createSwipeDesc(type, overrides.desc),
    computed: overrides.computed ?? null
  }
}
export function createInterpreterSwipeCommit<T extends keyof DescriptorSwipeMap>(
  type: T,
  overrides: InterpreterSwipeCommitOverrides<T> = {}
): InterpreterSwipeCommit {
  return {
    runtime: createRuntimeSwipeCommit(overrides.runtime),
    desc: createSwipeDesc(type, overrides.desc),
    computed: overrides.computed ?? null
  }
}

export function seedGesture(
  phase: "PENDING" | "SWIPING",
  pointerId = 1) {
  modifyGestureForTests(pointerId, {
    phase,
    pointerId,
    state: {
      start: { x: 0, y: 0 },
      last: { x: 0, y: 0 },
      totalDelta: { x: 0, y: 0 }
    },
    gesture: {
      desc: createCarouselDesc(),
      computed: createComputedSlider()
    }
  } as SwipingSession)
}