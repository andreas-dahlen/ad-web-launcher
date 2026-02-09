// intentForwarder.js
import { dispatcher } from './dispatcher'
// import { log } from '../../debug/functions'
import { buildPayload } from './buildPayload'
import { carouselSolver } from '../solvers/carouselSolver'
import { sliderSolver } from '../solvers/sliderSolver'
import { dragSolver } from '../solvers/dragSolver'

const solvers = {
  carousel: carouselSolver,
  slider: sliderSolver,
  drag: dragSolver
}

export function intentForward(intent) {
  // log('adapter', intent.type, intent)
  const payload = buildPayload(intent)
  forwardPacket(payload)
}

function forwardPacket(reactions) {
  if (!reactions) return
  // log('adapter', packet)
  for (const reaction of reactions) {
    if (!reaction?.type) {
      console.warn('Invalid reaction descriptor', reaction, reaction.type)
      continue
    }
    const { swipeType, type } = reaction
    const solverfn = solvers[swipeType]?.[type]

    if (solverfn) {
      const result = solverfn(reaction)
      Object.assign(reaction, result)
    }
    dispatcher.handle(reaction)
  }
}