// import { isGestureType, isStateFn2Arg } from '@interaction/types/gestureTypeGuards.ts'

import { interpreter } from './interpreter.ts'
import { carouselSolver } from '../solvers/carouselSolver.ts'
import { sliderSolver } from '../solvers/sliderSolver.ts'
import { dragSolver } from '../solvers/dragSolver.ts'
import { callStoreAction, type AllowedEvents } from '@interaction/zunstand/stateManager.ts'
import { render } from '../updater/renderer.ts'
import type { EventBridgeType, EventType, DataKeys } from '@interaction/types/primitives.ts'
import { isButtonDesc, isGestureType, isSliderDesc, type Descriptor } from '@interaction/types/descriptor.ts'
import type { Solutions } from '@interaction/types/solutions.ts'

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
   Solver typing
========================================================= */

type SolverFn = (desc: Descriptor) => Solutions | void

type SolverMap = Partial<Record<EventType, SolverFn>>

/* =========================================================
   Solver registry
========================================================= */

const solverRegistry: Partial<Record<DataKeys, SolverMap>> = {
  carousel: carouselSolver,
  slider: sliderSolver,
  drag: dragSolver
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

    const descriptor = interpreterFn(x, y, pointerId)

    if (!descriptor) return null
    /* -------------------------
       Solvers
    -------------------------- */

    const { base: { type, event } } = descriptor

    let solution: Descriptor = descriptor

    if (event && isGestureType(type) && !isButtonDesc(descriptor)) {
      const solverFn = solverRegistry[type]?.[event]
      const solverResult = solverFn?.(descriptor)

      if (solverResult) {
        solution = {
          ...descriptor,
          solutions: {
            ...descriptor.solutions,
            ...solverResult
          }
        }
        if (isSliderDesc(solution) && solution.solutions.gestureUpdate)
          interpreter.applyGestureUpdate(solution.solutions.gestureUpdate)

      }
      /* -------------------------
         State mutations
      -------------------------- */
      // if (!isButtonDesc(solution) && solution.solutions.stateAccepted && solution.base.event && solution.base.type) {

      //   if (solution.base.event && isGestureType(solution.base.type)) {

    }
    if (!isButtonDesc(solution) && solution.solutions.stateAccepted) {
      const { type, event } = solution.base
      if (isGestureType(type) && ['press', 'swipeStart', 'swipe', 'swipeCommit', 'swipeRevert'].includes(event)) {
        callStoreAction(type, event as AllowedEvents<typeof type>, solution)
      }
      // callStoreAction(solution.base.type, solution.base.event as Parameters<typeof callStoreAction<typeof solution.base.type, AllowedEvents<typeof solution.base.type>>>[1], solution)

      // const fn = callStoreAction[solution.base.event] as (type: DataKeys, desc: Descriptor) => unknown
      // fn(solution.base.type, solution.base.event, solution)


      // const fn = state[solution.runtime.event as keyof typeof state]
      // fn(solution.base.type, solution)
    }



    /* -------------------------
       Renderer
    -------------------------- */

    render.handle(solution)

    return solution
  }
}
