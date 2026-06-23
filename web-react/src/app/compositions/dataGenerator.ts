import type { Lane, LaneSystem } from '@app/compositions/layout.store'
import type { Axis1D } from '@typing/core.types'

const createId = () => crypto.randomUUID()
export const layout_DEFAULTS = {
  vertical: createLaneSystem("vertical"),
  horizontal: createLaneSystem("horizontal")
}


export function createLane(axis: Axis1D) {
  const laneId = createId()
  const sceneId = createId()

  return {
    laneId,
    axis,
    scenes: {
      [sceneId]: { sceneId }
    },
    sceneOrder: [sceneId]
  } satisfies Lane
}

export function createLaneSystem(axis: Axis1D) {
  const lane = createLane(axis)

  return {
    lanes: {
      [lane.laneId]: lane
    },
    laneOrder: [lane.laneId]
  } satisfies LaneSystem
}
