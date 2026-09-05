import { describe, expect, it } from 'vitest'

import {
  normalizeBase,
  exceedsCrossRange,
  getCommitOffset
} from '@interaction/solvers/utils/axis.utils.ts'

import type { Normalized1D } from '@interaction/types/solver.types.ts'
import type { AxisDirection } from '@shared/types/core.types.ts'

describe('[AXIS UTILS]', () => {
  describe('normalizeBase', () => {
    it('normalizes horizontal values', () => {
      expect(
        normalizeBase(
          {
            x: 100,
            y: 25
          },
          'horizontal',
          {
            x: 40,
            y: -10
          }
        )
      ).toEqual({
        mainOffset: 100,
        crossOffset: 25,
        mainDelta: 40,
        crossDelta: -10
      })
    })

    it('normalizes vertical values', () => {
      expect(
        normalizeBase(
          {
            x: 100,
            y: 25
          },
          'vertical',
          {
            x: 40,
            y: -10
          }
        )
      ).toEqual({
        mainOffset: 25,
        crossOffset: 100,
        mainDelta: -10,
        crossDelta: 40
      })
    })

    it('throws for an unknown axis at runtime', () => {
      expect(() =>
        normalizeBase(
          {
            x: 100,
            y: 25
          },
          'diagonal' as never,
          {
            x: 40,
            y: -10
          }
        )
      ).toThrow('resolveByAxis1D called with unknown axis: diagonal')
    })
  })

  describe('exceedsCrossRange', () => {
    const normalized = (
      crossOffset: number,
      crossDelta: number,
      crossSize = 100
    ): Normalized1D => ({
      mainOffset: 0,
      mainDelta: 0,
      crossOffset,
      crossDelta,
      mainSize: 200,
      crossSize,
      mainitemSize: 100,
      crossitemSize: 100
    })

    it('returns false when the position stays within the cross range', () => {
      expect(
        exceedsCrossRange(normalized(40, 10))
      ).toBe(false)
    })

    it('returns true when the position exceeds the lower boundary', () => {
      expect(
        exceedsCrossRange(normalized(0, -100))
      ).toBe(true)
    })

    it('returns true when the position exceeds the upper boundary', () => {
      expect(
        exceedsCrossRange(normalized(100, 100))
      ).toBe(true)
    })

    it('allows movement within the hysteresis range', () => {
      expect(
        exceedsCrossRange(normalized(0, -1))
      ).toBe(false)

      expect(
        exceedsCrossRange(normalized(100, 1))
      ).toBe(false)
    })

    it('uses zero when crossOffset is missing', () => {
      const norm = normalized(0, 0)
      norm.crossOffset = undefined as never

      expect(exceedsCrossRange(norm)).toBe(false)
    })

    it('uses zero when crossDelta is missing', () => {
      const norm = normalized(0, 0)
      norm.crossDelta = undefined as never

      expect(exceedsCrossRange(norm)).toBe(false)
    })

    it('uses zero when crossSize is missing', () => {
      const norm = normalized(0, 0)
      norm.crossSize = undefined as never

      expect(exceedsCrossRange(norm)).toBe(false)
    })
  })

  describe('getCommitOffset', () => {
    it.each([
      ['right', 200],
      ['down', 200],
      ['left', -200],
      ['up', -200]
    ] as const)(
      'returns %s lane size for %s direction',
      (dir, expected) => {
        expect(
          getCommitOffset(
            {
              axis: dir === 'left' || dir === 'right'
                ? 'horizontal'
                : 'vertical',
              dir
            } as AxisDirection,
            200
          )
        ).toBe(expected)
      }
    )

    it('returns zero when lane size is null', () => {
      expect(
        getCommitOffset(
          {
            axis: 'horizontal',
            dir: 'right'
          },
          null as never
        )
      ).toBe(0)
    })

    it('returns zero for an unknown direction at runtime', () => {
      expect(
        getCommitOffset(
          {
            axis: 'horizontal',
            dir: 'banana'
          } as never,
          200
        )
      ).toBe(0)
    })
  })
})