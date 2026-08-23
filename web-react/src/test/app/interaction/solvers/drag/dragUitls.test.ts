import { describe, expect, it } from 'vitest'

import { dragUtils } from '@interaction/solvers/dragSolver/drag.utils'

import { createDragDesc } from '@test/app/interaction/builders/desc.factory'

import type { DragData } from '@interaction/types/descriptor/data.types'

describe('[DRAG UTILS]', () => {
  describe('resolveSwipe', () => {
    it('returns the relative delta when movement stays within constraints', () => {
      const data = {
        settledOffset: {
          x: 20,
          y: 30
        },
        constraints: {
          minX: 0,
          maxX: 100,
          minY: 0,
          maxY: 100
        }
      }

      expect(
        dragUtils.resolveSwipe(data, {
          x: 15,
          y: -10
        })
      ).toEqual({
        x: 15,
        y: -10
      })
    })

    it('clamps movement against the settled offset and returns the relative result', () => {
      const data = {
        settledOffset: {
          x: 20,
          y: 30
        },
        constraints: {
          minX: 0,
          maxX: 100,
          minY: 0,
          maxY: 100
        }
      }

      expect(
        dragUtils.resolveSwipe(data, {
          x: -50,
          y: 100
        })
      ).toEqual({
        x: -20,
        y: 70
      })
    })

    it('clamps independently on both axes', () => {
      const data = {
        settledOffset: {
          x: 50,
          y: 50
        },
        constraints: {
          minX: 0,
          maxX: 100,
          minY: 0,
          maxY: 100
        }
      }

      expect(
        dragUtils.resolveSwipe(data, {
          x: 100,
          y: -100
        })
      ).toEqual({
        x: 50,
        y: -50
      })
    })
  })

  describe('resolveCommit', () => {
    it('returns the absolute position when it stays within constraints', () => {
      const data = {
        settledOffset: {
          x: 20,
          y: 30
        },
        constraints: {
          minX: 0,
          maxX: 100,
          minY: 0,
          maxY: 100
        }
      }

      expect(
        dragUtils.resolveCommit(data, {
          x: 40,
          y: 50
        })
      ).toEqual({
        x: 60,
        y: 80
      })
    })

    it('clamps the committed position to the constraints', () => {
      const data = {
        settledOffset: {
          x: 20,
          y: 30
        },
        constraints: {
          minX: 0,
          maxX: 100,
          minY: 0,
          maxY: 100
        }
      }

      expect(
        dragUtils.resolveCommit(data, {
          x: -50,
          y: 100
        })
      ).toEqual({
        x: 0,
        y: 100
      })
    })
  })

  describe('resolveSnapAdjustment', () => {
    const createSnapDesc = () => {
      const desc = createDragDesc()

      return {
        ...desc,
        base: {
          ...desc.base,
          layout: {
            ...desc.base.layout,
            deviceSize: {
              width: 1000,
              height: 800
            },
            itemSize: {
              width: 100,
              height: 100
            },
            containerSize: {
              ...desc.base.layout.containerSize,
              height: 200
            }
          }
        },
        data: {
          ...desc.data,
          constraints: {
            minX: -400,
            maxX: 400,
            minY: -300,
            maxY: 300
          },
          snap: {
            x: 4,
            y: 4
          }
        }
      }
    }

    it('returns null when snap is not configured', () => {
      const desc = createDragDesc({
        data: {
          snap: undefined
        } as DragData
      })

      expect(
        dragUtils.resolveSnapAdjustment(desc, {
          x: 123,
          y: 456
        })
      ).toBeNull()
    })

    it('returns the nearest configured snap position on both axes', () => {
      const desc = createSnapDesc()

      expect(
        dragUtils.resolveSnapAdjustment(desc, {
          x: 130,
          y: 170
        })
      ).toEqual({
        x: 75,
        y: 250
      })
    })

    it('clamps the selected snap position to the constraints', () => {
      const desc = createSnapDesc()

      desc.data.constraints.minX = 150
      desc.data.constraints.maxX = 160

      expect(
        dragUtils.resolveSnapAdjustment(desc, {
          x: 130,
          y: 170
        })
      ).toEqual({
        x: 150,
        y: 250
      })
    })

    it('leaves an axis unchanged when its snap count is zero', () => {
      const desc = createSnapDesc()

      desc.data.snap.x = 0
      desc.data.snap.y = 0

      expect(
        dragUtils.resolveSnapAdjustment(desc, {
          x: 130,
          y: 170
        })
      ).toEqual({
        x: 130,
        y: 170
      })
    })
  })
})