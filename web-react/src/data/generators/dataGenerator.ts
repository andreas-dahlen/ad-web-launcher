import type { Lane, LaneSystem } from '@stores/layout.store'
import type { Axis1D } from '../../shared/types/core.types'
import { createId } from '@data/generators/idGenerator'

export const layout_DEFAULTS = {
  vertical: createLaneSystem("vertical"),
  horizontal: createLaneSystem("horizontal")
}


export function createLane(axis: Axis1D) {
  const laneId = createId("lane")
  const sceneId = createId("scene")

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
