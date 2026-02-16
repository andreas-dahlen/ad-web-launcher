// intentForwarder.js
import { dispatcher } from './renderer'
// import { log } from '../../debug/functions'
import { carouselSolver } from '../solvers/carouselSolver'
import { sliderSolver } from '../solvers/sliderSolver'
import { dragSolver } from '../solvers/dragSolver'



const solvers = {
  carousel: carouselSolver,
  slider: sliderSolver,
  drag: dragSolver
}

export function forward(reaction) {
  if (!reaction?.type) {
    console.warn('Invalid reaction descriptor', reaction, reaction.type)
  }
  const { swipeType, type } = reaction
  const solverfn = solvers[swipeType]?.[type]

  if (solverfn) {
    const result = solverfn(reaction)
    Object.assign(reaction, result)
  }
  dispatcher.handle(reaction)
}
