import type {
  Descriptor,
  GestureType,
  EventType,
  EventBridgeType,
  CancelData,
  SwipeType
} from '../../types/gestures'

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

type SolverFn = (desc: Descriptor) => Partial<Descriptor> | void

type Solver = Partial<Record<EventType, SolverFn>>

/* =========================================================
   Solver registry
========================================================= */

const solvers: Partial<Record<GestureType, Solver>> = {
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

    const { type, event } = descriptor

    let solution: Descriptor = descriptor

    if (type && event) {

      const solverFn = solvers[type]?.[event]

      if (solverFn) {

        const solverResult = solverFn(descriptor)

        if (solverResult) {
          solution = { ...descriptor, ...solverResult }
        }

        if (solution.gestureUpdate) {
          interpreter.applyGestureUpdate(solution.gestureUpdate, solution.type as SwipeType)
        }
      }
    }

    /* -------------------------
       State mutations
    -------------------------- */

    if (solution.stateAccepted && solution.event && solution.type) {

      // const key = solution.event as keyof typeof state
      // const fn = state[key]
      // if (fn) {
      //   fn(solution.type, solution)
      // state[solution.event as keyof typeof state](solution.type, solution)

      const fn = state[solution.event as keyof typeof state]
      fn(solution.type, solution)
    }

    /* -------------------------
       Renderer
    -------------------------- */

    if (solution.cancel) {
      render.handle(solution.cancel)
    }

    render.handle(solution)

    return solution
  }
}