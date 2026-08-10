import { describe, expect, it } from 'vitest'

import { vector } from '@interaction/solvers/utils/vector.utils'

import { APP_CONFIG } from '@config/app.config'
import type { AxisDirection } from '@shared/types/core.types'

describe('[VECTOR UTILS]', () => {
  describe('clamp', () => {
    it('returns the value when it is within the range', () => {
      expect(vector.clamp(50, 0, 100)).toBe(50)
    })

    it('clamps values below the minimum', () => {
      expect(vector.clamp(-25, 0, 100)).toBe(0)
    })

    it('clamps values above the maximum', () => {
      expect(vector.clamp(125, 0, 100)).toBe(100)
    })

    it('returns the value when the minimum is undefined', () => {
      expect(vector.clamp(-25, undefined as never, 100)).toBe(-25)
    })

    it('returns the value when the maximum is undefined', () => {
      expect(vector.clamp(125, 0, undefined as never)).toBe(125)
    })
  })

  describe('clamp2D', () => {
    const constraints = {
      minX: 0,
      maxX: 100,
      minY: -50,
      maxY: 50
    }

    it('clamps both axes independently', () => {
      expect(
        vector.clamp2D(
          { x: 150, y: -100 },
          { x: 20, y: 10 },
          constraints
        )
      ).toEqual({
        x: 100,
        y: -50
      })
    })

    it('returns the absolute position when both axes remain within constraints', () => {
      expect(
        vector.clamp2D(
          { x: 20, y: 15 },
          { x: 30, y: 10 },
          constraints
        )
      ).toEqual({
        x: 50,
        y: 25
      })
    })

    it('clamps each axis against its own constraints', () => {
      expect(
        vector.clamp2D(
          { x: -100, y: 100 },
          { x: 20, y: 10 },
          constraints
        )
      ).toEqual({
        x: 0,
        y: 50
      })
    })
  })

  describe('relativeClamp2D', () => {
    const constraints = {
      minX: 0,
      maxX: 100,
      minY: 0,
      maxY: 100
    }

    it('returns the original delta when the resulting position stays within constraints', () => {
      expect(
        vector.relativeClamp2D(
          { x: 20, y: -10 },
          { x: 40, y: 50 },
          constraints
        )
      ).toEqual({
        x: 20,
        y: -10
      })
    })

    it('returns the relative delta after clamping the resulting position', () => {
      expect(
        vector.relativeClamp2D(
          { x: -100, y: 100 },
          { x: 40, y: 50 },
          constraints
        )
      ).toEqual({
        x: -40,
        y: 50
      })
    })
  })

  describe('resolveByAxis1D', () => {
    it('resolves horizontal values into main and cross axes', () => {
      expect(
        vector.resolveByAxis1D(100, 50, 'horizontal')
      ).toEqual({
        main: 100,
        cross: 50
      })
    })

    it('resolves vertical values into main and cross axes', () => {
      expect(
        vector.resolveByAxis1D(100, 50, 'vertical')
      ).toEqual({
        main: 50,
        cross: 100
      })
    })

    it('throws for an unknown axis at runtime', () => {
      expect(() =>
        vector.resolveByAxis1D(100, 50, 'diagonal' as never)
      ).toThrow(
        'resolveByAxis1D called with unknown axis: diagonal'
      )
    })
  })

  describe('resolveDirection1D', () => {
    it.each([
      ['horizontal', 100, 'right'],
      ['horizontal', -100, 'left'],
      ['vertical', 100, 'down'],
      ['vertical', -100, 'up']
    ] as const)(
      'resolves %s delta %s to %s',
      (axis, delta, dir) => {
        expect(
          vector.resolveDirection1D(delta, axis)
        ).toEqual({
          axis,
          dir
        })
      }
    )

    it('treats zero horizontal delta as left', () => {
      expect(
        vector.resolveDirection1D(0, 'horizontal')
      ).toEqual({
        axis: 'horizontal',
        dir: 'left'
      })
    })

    it('treats zero vertical delta as up', () => {
      expect(
        vector.resolveDirection1D(0, 'vertical')
      ).toEqual({
        axis: 'vertical',
        dir: 'up'
      })
    })
  })

  describe('getDir', () => {
    it('uses the horizontal threshold value', () => {
      expect(
        vector.getDir(
          { x: 100, y: -100 },
          'horizontal'
        )
      ).toEqual({
        axis: 'horizontal',
        dir: 'right'
      })
    })

    it('uses the vertical threshold value', () => {
      expect(
        vector.getDir(
          { x: 100, y: -100 },
          'vertical'
        )
      ).toEqual({
        axis: 'vertical',
        dir: 'up'
      })
    })
  })

  describe('isValidDir', () => {
    it.each([
      ['down', 'top', true],
      ['up', 'bottom', true],
      ['left', 'right', true],
      ['right', 'left', true]
    ] as const)(
      'accepts %s when overflow side is %s',
      (dir, overflowSide, expected) => {
        expect(
          vector.isValidDir(
            {
              axis: dir === 'left' || dir === 'right'
                ? 'horizontal'
                : 'vertical',
              dir
            } as AxisDirection,
            overflowSide
          )
        ).toBe(expected)
      }
    )

    it.each([
      ['down', 'bottom'],
      ['up', 'top'],
      ['left', 'left'],
      ['right', 'right']
    ] as const)(
      'rejects %s when overflow side is %s',
      (dir, overflowSide) => {
        expect(
          vector.isValidDir(
            {
              axis: dir === 'left' || dir === 'right'
                ? 'horizontal'
                : 'vertical',
              dir
            } as AxisDirection,
            overflowSide
          )
        ).toBe(false)
      }
    )
  })

  describe('shouldCommit', () => {
    const ratio = APP_CONFIG.swipeCommitRatio

    it('returns false when lane size is missing', () => {
      expect(
        vector.shouldCommit(100, null as never, 'horizontal')
      ).toBe(false)
    })

    it('returns false when the delta is below the horizontal threshold', () => {
      const laneSize = 200
      const threshold = laneSize * ratio

      expect(
        vector.shouldCommit(threshold - 1, laneSize, 'horizontal')
      ).toBe(false)
    })

    it('returns true when the delta reaches the horizontal threshold', () => {
      const laneSize = 200
      const threshold = laneSize * ratio

      expect(
        vector.shouldCommit(threshold, laneSize, 'horizontal')
      ).toBe(true)
    })

    it('uses absolute delta for horizontal commits', () => {
      const laneSize = 200
      const threshold = laneSize * ratio

      expect(
        vector.shouldCommit(-threshold, laneSize, 'horizontal')
      ).toBe(true)
    })

    it('applies the vertical axis bias to the threshold', () => {
      const laneSize = 200
      const threshold =
        laneSize * ratio * 0.65

      expect(
        vector.shouldCommit(threshold, laneSize, 'vertical')
      ).toBe(true)

      expect(
        vector.shouldCommit(threshold - 1, laneSize, 'vertical')
      ).toBe(false)
    })
  })
})