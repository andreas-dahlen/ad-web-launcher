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

  orchestrate(event) {
    if (!event?.eventType) {
      console.warn('invalid eventPackage for interpreter', event, event.eventType)
      return null
    }
    /* -------------------------
            Interpreter
    -------------------------- */
    const { eventType, x, y } = event
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
    const { swipeType, type } = descriptor
    const solverfn = solvers[swipeType]?.[type]
    
    // Apply solver if available, merging with interpreter descriptor
    let solution = descriptor
    if (solverfn) {
      solution = { ...descriptor, ...solverfn(descriptor) }
      if(solution.gestureUpdate) {
        interpreter.applyGestureUpdate(solution.gestureUpdate)
      }
    }
    if (descriptor.type === 'swipeCommit' || descriptor.type === 'pressRelease') {
      interpreter.resetGesture()
    }
    /* -------------------------
            Mutate state files (swipeStart, swipe, swipeCommit, swipeRevert)
    -------------------------- */

    if (solution.stateAccepted && state[solution.type]) {
      state[solution.type](solution.swipeType, solution)
    }
    /* -------------------------
        Renderer
-------------------------- */
    if (solution.extra) {
      render.handle(solution.extra)
    }
    render.handle(solution)
  }
}
