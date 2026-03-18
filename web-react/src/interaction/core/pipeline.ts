import { isGestureType, isStateFn2Arg } from '@utils/gestureTypeGuards.ts'

import { interpreter } from './interpreter.ts'
import { carouselSolver } from '../solvers/carouselSolver.ts'
import { sliderSolver } from '../solvers/sliderSolver.ts'
import { dragSolver } from '../solvers/dragSolver.ts'
import { state } from '../state/stateManager.ts'
import { render } from '../updater/renderer.ts'

/* =========================================================
   Pointer bridge input
========================================================= */

interface PointerEventPackage {
  eventType: EventBridgeType
  x: number
  y: number
}

/* =========================================================
   Solver typing
========================================================= */

type SolverFn = (desc: Descriptor) => Partial<RuntimeData> | void

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

type InterpreterFn = (x: number, y: number) => Descriptor | null

const interpreterMap: Record<EventBridgeType, InterpreterFn> = {
  down: interpreter.onDown,
  move: interpreter.onMove,
  up: interpreter.onUp
}

/* =========================================================
   Pipeline
========================================================= */

export const pipeline = {

  orchestrate(desc: PointerEventPackage) {

    /* -------------------------
       Interpreter
    -------------------------- */

    const { eventType, x, y } = desc

    const interpreterFn = interpreterMap[eventType]

    if (!interpreterFn) {
      console.warn('Unknown eventType', eventType)
      return null
    }

    const descriptor = interpreterFn(x, y)

    if (!descriptor) return null
    /* -------------------------
       Solvers
    -------------------------- */

    const { base: { type }, runtime: { event } } = descriptor

    let solution: Descriptor = descriptor

    if (event && isGestureType(type)) {
      const solverFn = solverRegistry[type]?.[event]
      const solverResult = solverFn?.(descriptor)

      if (solverResult) {
        solution = {
          ...descriptor,
          runtime: {
            ...descriptor.runtime,
            ...solverResult
          }
        }

      }
      if (solution.runtime.gestureUpdate) {
        interpreter.applyGestureUpdate(solution.runtime.gestureUpdate)
      }
    }

    /* -------------------------
       State mutations
    -------------------------- */
    if (solution.runtime.stateAccepted && solution.runtime.event && solution.base.type) {

      // const fn = state[solution.runtime.event as keyof typeof state]
      // fn(solution.base.type, solution)
      if (solution.runtime.event && isStateFn2Arg(solution.runtime.event) && isGestureType(solution.base.type)) {
        const fn = state[solution.runtime.event] as (type: DataKeys, desc: Descriptor) => unknown
        fn(solution.base.type, solution)
      }
    }

    /* -------------------------
       Renderer
    -------------------------- */

    render.handle(solution)

    return solution
  }
}
