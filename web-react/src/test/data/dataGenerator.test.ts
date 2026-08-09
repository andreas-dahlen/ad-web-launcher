import { describe, expect, it } from 'vitest'

import {
  createLane,
  layout_DEFAULTS
} from '@data/generators/dataGenerator'

describe('[DATA GENERATORS]', () => {
  describe('createLane', () => {
    it.each([
      'horizontal',
      'vertical'
    ] as const)('creates a %s lane', axis => {
      const lane = createLane(axis)

      expect(lane.axis).toBe(axis)
      expect(lane.laneId).toMatch(/^lane_/)

      expect(lane.sceneOrder).toHaveLength(1)

      const sceneId = lane.sceneOrder[0]

      expect(sceneId).toMatch(/^scene_/)

      expect(lane.scenes).toEqual({
        [sceneId]: {
          sceneId
        }
      })
    })

    it('uses the same scene id in sceneOrder and scenes', () => {
      const lane = createLane('horizontal')

      const [sceneId] = lane.sceneOrder

      expect(lane.scenes[sceneId]).toEqual({
        sceneId
      })
    })

    it('creates unique lane and scene ids', () => {
      const first = createLane('horizontal')
      const second = createLane('horizontal')

      expect(first.laneId).not.toBe(second.laneId)
      expect(first.sceneOrder[0]).not.toBe(second.sceneOrder[0])
    })
  })

  describe('layout_DEFAULTS', () => {
    it('contains vertical and horizontal lane systems', () => {
      expect(layout_DEFAULTS).toHaveProperty('vertical')
      expect(layout_DEFAULTS).toHaveProperty('horizontal')
    })

    it.each([
      'vertical',
      'horizontal'
    ] as const)('creates one default %s lane', axis => {
      const system = layout_DEFAULTS[axis]

      expect(system.laneOrder).toHaveLength(1)

      const laneId = system.laneOrder[0]
      const lane = system.lanes[laneId]

      expect(lane).toBeDefined()
      expect(lane.laneId).toBe(laneId)
      expect(lane.axis).toBe(axis)
      expect(lane.sceneOrder).toHaveLength(1)
    })

    it('creates independent vertical and horizontal systems', () => {
      const verticalLaneId =
        layout_DEFAULTS.vertical.laneOrder[0]

      const horizontalLaneId =
        layout_DEFAULTS.horizontal.laneOrder[0]

      expect(verticalLaneId)
        .not.toBe(horizontalLaneId)

      expect(
        layout_DEFAULTS.vertical.lanes[verticalLaneId]
      ).not.toBe(
        layout_DEFAULTS.horizontal.lanes[horizontalLaneId]
      )
    })
  })
})