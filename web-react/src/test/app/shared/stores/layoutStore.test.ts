import { beforeEach, describe, expect, it } from 'vitest'

import { layoutStore, type LaneSystem } from '@shared/state/stores/layout.store'

const emptyDefaults = (): {
  vertical: LaneSystem
  horizontal: LaneSystem
} => ({
  vertical: {
    lanes: {},
    laneOrder: []
  },
  horizontal: {
    lanes: {},
    laneOrder: []
  }
})

const getState = () => layoutStore.getState()

describe('[LAYOUT STORE]', () => {
  beforeEach(() => {
    getState().overrideToDefaults(emptyDefaults())
  })

  describe('initial state', () => {
    it('starts with empty horizontal and vertical systems', () => {
      expect(getState().horizontal).toEqual({
        lanes: {},
        laneOrder: []
      })

      expect(getState().vertical).toEqual({
        lanes: {},
        laneOrder: []
      })
    })
  })

  describe('overrideToDefaults', () => {
    it('replaces both lane systems', () => {
      const defaults = {
        horizontal: {
          lanes: {
            h1: {
              laneId: 'h1',
              axis: 'horizontal' as const,
              scenes: {},
              sceneOrder: []
            }
          },
          laneOrder: ['h1']
        },
        vertical: {
          lanes: {
            v1: {
              laneId: 'v1',
              axis: 'vertical' as const,
              scenes: {},
              sceneOrder: []
            }
          },
          laneOrder: ['v1']
        }
      }

      getState().overrideToDefaults(defaults)

      expect(getState().horizontal).toEqual(defaults.horizontal)
      expect(getState().vertical).toEqual(defaults.vertical)
    })
  })

  describe('addLane', () => {
    it('adds a horizontal lane', () => {
      getState().addLane('horizontal')

      const state = getState()

      expect(state.horizontal.laneOrder).toHaveLength(1)

      const laneId = state.horizontal.laneOrder[0]
      const lane = state.horizontal.lanes[laneId]

      expect(lane).toBeDefined()
      expect(lane.axis).toBe('horizontal')
      expect(lane.laneId).toBe(laneId)
    })

    it('adds a vertical lane', () => {
      getState().addLane('vertical')

      const state = getState()

      expect(state.vertical.laneOrder).toHaveLength(1)

      const laneId = state.vertical.laneOrder[0]
      expect(state.vertical.lanes[laneId].axis).toBe('vertical')
    })

    it('keeps horizontal and vertical lanes separate', () => {
      getState().addLane('horizontal')
      getState().addLane('vertical')

      expect(getState().horizontal.laneOrder).toHaveLength(1)
      expect(getState().vertical.laneOrder).toHaveLength(1)
    })

    it('preserves the generated lane scenes', () => {
      getState().addLane('horizontal')

      const state = getState()
      const laneId = state.horizontal.laneOrder[0]
      const lane = state.horizontal.lanes[laneId]

      expect(lane.sceneOrder.length).toBeGreaterThan(0)

      for (const sceneId of lane.sceneOrder) {
        expect(lane.scenes[sceneId]).toEqual({
          sceneId
        })
      }
    })
  })

  describe('deleteLane', () => {
    it('deletes a lane', () => {
      getState().addLane('horizontal')
      getState().addLane('horizontal')

      const stateBefore = getState()
      const laneId = stateBefore.horizontal.laneOrder[1]

      getState().deleteLane('horizontal', laneId)

      expect(getState().horizontal.laneOrder).toEqual([
        stateBefore.horizontal.laneOrder[0]
      ])
      expect(getState().horizontal.lanes[laneId]).toBeUndefined()
    })

    it('does not delete the last remaining lane', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]

      getState().deleteLane('horizontal', laneId)

      expect(getState().horizontal.laneOrder).toEqual([laneId])
      expect(getState().horizontal.lanes[laneId]).toBeDefined()
    })

    it('does nothing for a missing lane', () => {
      getState().addLane('horizontal')

      const before = getState().horizontal

      getState().deleteLane('horizontal', 'missing')

      expect(getState().horizontal).toEqual(before)
    })
  })

  describe('moveLane', () => {
    it('moves a lane forward', () => {
      getState().addLane('horizontal')
      getState().addLane('horizontal')
      getState().addLane('horizontal')

      const order = [...getState().horizontal.laneOrder]

      getState().moveLane('horizontal', order[0], 1)

      expect(getState().horizontal.laneOrder).toEqual([
        order[1],
        order[0],
        order[2]
      ])
    })

    it('moves a lane backward', () => {
      getState().addLane('horizontal')
      getState().addLane('horizontal')
      getState().addLane('horizontal')

      const order = [...getState().horizontal.laneOrder]

      getState().moveLane('horizontal', order[2], -1)

      expect(getState().horizontal.laneOrder).toEqual([
        order[0],
        order[2],
        order[1]
      ])
    })

    it('does not move the first lane backward', () => {
      getState().addLane('horizontal')
      getState().addLane('horizontal')

      const order = [...getState().horizontal.laneOrder]

      getState().moveLane('horizontal', order[0], -1)

      expect(getState().horizontal.laneOrder).toEqual(order)
    })

    it('does not move the last lane forward', () => {
      getState().addLane('horizontal')
      getState().addLane('horizontal')

      const order = [...getState().horizontal.laneOrder]

      getState().moveLane('horizontal', order[1], 1)

      expect(getState().horizontal.laneOrder).toEqual(order)
    })

    it('does nothing for a missing lane', () => {
      getState().addLane('horizontal')
      const order = [...getState().horizontal.laneOrder]

      getState().moveLane('horizontal', 'missing', 1)

      expect(getState().horizontal.laneOrder).toEqual(order)
    })
  })

  describe('addScene', () => {
    it('adds a scene to a lane', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]
      const before = getState().horizontal.lanes[laneId].sceneOrder.length

      getState().addScene('horizontal', laneId)

      const lane = getState().horizontal.lanes[laneId]

      expect(lane.sceneOrder).toHaveLength(before + 1)

      const sceneId = lane.sceneOrder.at(-1)!

      expect(lane.scenes[sceneId]).toEqual({
        sceneId
      })
    })

    it('does nothing for a missing lane', () => {
      getState().addScene('horizontal', 'missing')

      expect(getState().horizontal).toEqual({
        lanes: {},
        laneOrder: []
      })
    })
  })

  describe('deleteScene', () => {
    it('deletes a scene', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]
      getState().addScene('horizontal', laneId)

      const order = [
        ...getState().horizontal.lanes[laneId].sceneOrder
      ]

      const sceneId = order[1]

      getState().deleteScene(
        'horizontal',
        laneId,
        sceneId
      )

      const lane = getState().horizontal.lanes[laneId]

      expect(lane.sceneOrder).toEqual([order[0]])
      expect(lane.scenes[sceneId]).toBeUndefined()
    })

    it('does not delete the last remaining scene', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]
      const sceneId =
        getState().horizontal.lanes[laneId].sceneOrder[0]

      getState().deleteScene(
        'horizontal',
        laneId,
        sceneId
      )

      const lane = getState().horizontal.lanes[laneId]

      expect(lane.sceneOrder).toEqual([sceneId])
      expect(lane.scenes[sceneId]).toBeDefined()
    })

    it('does nothing for a missing lane', () => {
      getState().deleteScene(
        'horizontal',
        'missing',
        'scene'
      )

      expect(getState().horizontal).toEqual({
        lanes: {},
        laneOrder: []
      })
    })

    it('does nothing for a missing scene', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]
      const before = {
        ...getState().horizontal.lanes[laneId]
      }

      getState().deleteScene(
        'horizontal',
        laneId,
        'missing'
      )

      expect(getState().horizontal.lanes[laneId]).toEqual(before)
    })
  })

  describe('moveScene', () => {
    it('moves a scene forward', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]

      getState().addScene('horizontal', laneId)

      const order = [
        ...getState().horizontal.lanes[laneId].sceneOrder
      ]

      getState().moveScene(
        'horizontal',
        laneId,
        order[0],
        1
      )

      expect(
        getState().horizontal.lanes[laneId].sceneOrder
      ).toEqual([
        order[1],
        order[0]
      ])
    })

    it('moves a scene backward', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]

      getState().addScene('horizontal', laneId)

      const order = [
        ...getState().horizontal.lanes[laneId].sceneOrder
      ]

      getState().moveScene(
        'horizontal',
        laneId,
        order[1],
        -1
      )

      expect(
        getState().horizontal.lanes[laneId].sceneOrder
      ).toEqual([
        order[1],
        order[0]
      ])
    })

    it('does not move beyond the boundaries', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]
      const order = [
        ...getState().horizontal.lanes[laneId].sceneOrder
      ]

      getState().moveScene(
        'horizontal',
        laneId,
        order[0],
        -1
      )

      expect(
        getState().horizontal.lanes[laneId].sceneOrder
      ).toEqual(order)
    })

    it('does nothing for a missing lane', () => {
      getState().moveScene(
        'horizontal',
        'missing',
        'scene',
        1
      )

      expect(getState().horizontal).toEqual({
        lanes: {},
        laneOrder: []
      })
    })

    it('does nothing for a missing scene', () => {
      getState().addLane('horizontal')

      const laneId = getState().horizontal.laneOrder[0]
      const order = [
        ...getState().horizontal.lanes[laneId].sceneOrder
      ]

      getState().moveScene(
        'horizontal',
        laneId,
        'missing',
        1
      )

      expect(
        getState().horizontal.lanes[laneId].sceneOrder
      ).toEqual(order)
    })
  })
})