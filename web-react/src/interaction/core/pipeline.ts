import type {
  Descriptor,
  GestureType,
  EventType,
  EventBridgeType
} from '../../types/gestures'

import { interpreter } from './interpreter'
import { carouselSolver } from '../solvers/carouselSolver'
import { sliderSolver } from '../solvers/sliderSolver'
import { dragSolver } from '../solvers/dragSolver'
import { state } from '../state/stateManager'
import { render } from '../updater/renderer'

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
          interpreter.applyGestureUpdate(solution.gestureUpdate)
        }
      }
    }

    /* -------------------------
       State mutations
    -------------------------- */

    if (solution.stateAccepted && solution.event && state[solution.event]) {
      state[solution.event](solution.type, solution)
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