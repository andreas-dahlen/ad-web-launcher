//buildPayload.js
import { state } from "../state/stateManager"


export function buildPayload(result) {
  const reactions = []

  const current = result?.target ?? null

  if (!current) return [] // no target, nothing to do

  // 1. Derived side-effect: pressCancel
  if (result?.pressCancel) {
    reactions.push({
      type: 'pressCancel',
      element: result.pressCancel.element,
      delta: result.delta ?? null
    })
  }
  // 2. Primary reaction
  reactions.push({
    type: result.type ?? null,
    element: current.element ?? null,
    delta: result?.delta ?? null,
    axis: result?.axis ?? null,
    laneId: current.laneId ?? null,
    swipeType: current.swipeType ?? null,
    laneSize: state.getSize(current.swipeType, current.laneId) ?? null,
    position: state.getPosition(current.swipeType, current.laneId) ?? null,
    constraints: state.getConstraints(current.swipeType, current.laneId) ?? null
  })
  return reactions
}

