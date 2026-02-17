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
    const facts = interpreterFn(x, y)
    if (!facts) return null
    
    if (facts.type === 'swipeCommit' || facts.type === 'pressRelease') {
    interpreter.resetGesture()
}
/* -------------------------
        Solvers
-------------------------- */
    const { swipeType, type } = facts
    const solverfn = solvers[swipeType]?.[type]

    // Apply solver if available, merging with interpreter facts
    let solution = facts
    if (solverfn) {
      solution = {...facts, ...solverfn(facts)}
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
    if(solution.extra) {
      render.handle(solution.extra)
    }
    render.handle(solution)
  }
}
