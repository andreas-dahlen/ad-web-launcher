// import { isGestureType, isStateFn2Arg } from '@interaction/types/gestureTypeGuards.ts'

import { interpreter } from './interpreter.ts'
import { carouselSolver } from '../solvers/carouselSolver.ts'
import { sliderSolver } from '../solvers/sliderSolver.ts'
import { dragSolver } from '../solvers/dragSolver.ts'
import { render } from '../updater/renderer.ts'
import type { EventBridgeType, EventType, DataKeys } from '@interaction/types/primitives.ts'
import type { Descriptor } from '@interaction/types/descriptor.ts'
import type { Solutions } from '@interaction/types/solutions.ts'
import { dragStore, type DragStore } from '@interaction/zunstand/dragState.ts'
import { sliderStore, type SliderStore } from '@interaction/zunstand/sliderState.ts'
import { carouselStore, type CarouselStore } from '@interaction/zunstand/carouselState.ts'

/* =========================================================
   Pointer bridge input
========================================================= */

interface PointerEventPackage {
  eventType: EventBridgeType
  x: number
  y: number
  pointerId: number
}

/* =========================================================
   Interpreter bridge
========================================================= */

type InterpreterFn = (x: number, y: number, pointerId: number) => Descriptor | null

const interpreterMap: Record<EventBridgeType, InterpreterFn> = {
  down: interpreter.onDown,
  move: interpreter.onMove,
  up: interpreter.onUp
}

/* =========================================================
   Solver typing
========================================================= */

type SolverFn = (desc: Descriptor) => Solutions | void
type SolverMap = Partial<Record<EventType, SolverFn>>

const solverRegistry: Partial<Record<DataKeys, SolverMap>> = {
  carousel: carouselSolver,
  slider: sliderSolver,
  drag: dragSolver
}

/* =========================================================
   State mutation typing
========================================================= */

type EventMap = {
  carousel: ['swipe', 'swipeStart', 'swipeCommit', 'swipeRevert']
  slider: ['press', 'swipeStart', 'swipe', 'swipeCommit']
  drag: ['swipeStart', 'swipe', 'swipeCommit']
}
type CarouselFunctions = Pick<
  CarouselStore,
  EventMap['carousel'][number]>

type SliderFunctions = Pick<
  SliderStore,
  EventMap['slider'][number]>

type DragFunctions = Pick<
  DragStore,
  EventMap['drag'][number]>

/* =========================================================
   Pipeline
========================================================= */

export const pipeline = {
  /* -------------------------
     Abort!
  -------------------------- */
  abortGesture(pointerId: number) {
    interpreter.deleteGesture(pointerId)
  },

  orchestrate(desc: PointerEventPackage) {

    /* -------------------------
       Interpreter
    -------------------------- */

    const { eventType, x, y, pointerId } = desc
    const interpreterFn = interpreterMap[eventType]

    if (!interpreterFn) {
      console.warn('Unknown eventType', eventType)
      return null
    }

    const baseDesc = interpreterFn(x, y, pointerId)
    if (!baseDesc) return null
    /* -------------------------
       Solvers
    -------------------------- */

    const { type, base: { event } } = baseDesc

    let modDesc: Descriptor = baseDesc

    if (event && type !== 'button') {
      const solverFn = solverRegistry[type]?.[event]
      const solverResult = solverFn?.(baseDesc)

      if (solverResult) {
        modDesc = {
          ...baseDesc,
          solutions: {
            ...baseDesc.solutions,
            ...solverResult
          }
        }
      }
    }
    const { type: modType, base: { event: modEvent } } = modDesc
    if (modType === 'slider' && modDesc.solutions.gestureUpdate) {
      interpreter.applyGestureUpdate(modDesc.solutions.gestureUpdate)
    }

    switch (modType) {
      case 'carousel': {
        const state = carouselStore.getState()
        const fn = state[modEvent as keyof CarouselFunctions]
        fn?.(modDesc)
        break
      }
      case 'slider': {
        const state = sliderStore.getState()
        const fn = state[modEvent as keyof SliderFunctions]
        fn?.(modDesc)
        break
      }
      case 'drag': {
        const state = dragStore.getState()
        const fn = state[modEvent as keyof DragFunctions]
        fn?.(modDesc)
        break
      }
      case 'button': {
        break
      }
      default: { throw new Error(`Unknown descriptor type: ${modType}`) }
    }

    /* -------------------------
       Renderer
    -------------------------- */

    render.handle(modDesc)

    return modDesc
  }
}
