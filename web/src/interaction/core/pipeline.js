// pipeline.js
// import { log } from '../../debug/functions'
import { interpreter } from './interpreter'
import { carouselSolver } from '../solvers/carouselSolver'
import { sliderSolver } from '../solvers/sliderSolver'
import { dragSolver } from '../solvers/dragSolver'
import { state } from '../state/stateManager'
import { render } from '../updater/renderer'

const solvers = {
  carousel: carouselSolver,
  slider: sliderSolver,
  drag: dragSolver
}
const interpreterMap = {
  down: interpreter.onDown,
  move: interpreter.onMove,
  up: interpreter.onUp
}

export const pipeline = {

  orchestrate(desc) {
    if (!desc?.eventType) {
      console.warn('invalid eventPackage for interpreter', desc, desc.eventType)
      return null
    }
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
    const solverfn = solvers[type]?.[event]
    
    // Apply solver if available, merging with interpreter descriptor
    let solution = descriptor
    if (solverfn) {
      solution = { ...descriptor, ...solverfn(descriptor) }
      if(solution.gestureUpdate) {
        interpreter.applyGestureUpdate(solution.gestureUpdate)
      }
    }
    /* -------------------------
            Mutate state files (swipeStart, swipe, swipeCommit, swipeRevert)
    -------------------------- */
    if (solution.stateAccepted && state[solution.event]) {
      state[solution.event](solution.type, solution)
    }
    /* -------------------------
        Renderer
-------------------------- */
    if (solution.cancel) {
      render.handle(solution.cancel)
    }
    render.handle(solution)
  }
}
