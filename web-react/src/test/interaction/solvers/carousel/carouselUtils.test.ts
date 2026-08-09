import { describe, expect, it } from 'vitest'

import { carouselUtils } from '@interaction/solvers/carouselSolver/carousel.utils'
import { APP_CONFIG } from '@config/app.config'

import { createCarouselDesc } from '@test/builders/desc.factory'

import type { Normalized1D } from '@interaction/types/solver.types'

describe('[CAROUSEL UTILS]', () => {
  describe('normalize', () => {
    const desc = createCarouselDesc()

    it('normalizes horizontal axis values', () => {
      const base = {
        ...desc.base,
        axis: 'horizontal' as const,
        layout: {
          ...desc.base.layout,
          grabOffset: {
            x: 100,
            y: 25
          },
          containerSize: {
            width: 500,
            height: 300
          },
          itemSize: {
            width: 200,
            height: 150
          }
        }
      }

      const result = carouselUtils.normalize(base, {
        x: 40,
        y: -10
      })

      expect(result).toEqual({
        mainOffset: 100,
        crossOffset: 25,
        mainDelta: 40,
        crossDelta: -10,
        mainSize: 500,
        crossSize: 300,
        mainitemSize: 200,
        crossitemSize: 150
      })
    })

    it('normalizes vertical axis values', () => {
      const base = {
        ...desc.base,
        axis: 'vertical' as const,
        layout: {
          ...desc.base.layout,
          grabOffset: {
            x: 100,
            y: 25
          },
          containerSize: {
            width: 500,
            height: 300
          },
          itemSize: {
            width: 200,
            height: 150
          }
        }
      }

      const result = carouselUtils.normalize(base, {
        x: 40,
        y: -10
      })

      expect(result).toEqual({
        mainOffset: 25,
        crossOffset: 100,
        mainDelta: -10,
        crossDelta: 40,
        mainSize: 300,
        crossSize: 500,
        mainitemSize: 150,
        crossitemSize: 200
      })
    })
  })

  describe('isLocked', () => {
    it.each([
      [null, null, 0, 100, false],
      [null, null, 0, -100, false],

      [2, null, 2, 100, true],
      [2, null, 2, -100, false],
      [2, null, 3, 100, false],

      [null, 2, 2, -100, true],
      [null, 2, 2, 100, false],
      [null, 2, 3, -100, false],

      [2, 3, 2, 100, true],
      [2, 3, 3, -100, true],
      [2, 3, 4, 100, false],
      [2, 3, 4, -100, false]
    ])(
      'returns %s for prev=%s next=%s index=%s delta=%s',
      (prev, next, index, delta, expected) => {
        expect(
          carouselUtils.isLocked(delta, index, { prev, next })
        ).toBe(expected)
      }
    )
  })

  describe('resolveCommit', () => {
    const mainSize = 200

    const horizontal = (mainDelta: number): Normalized1D => ({
      mainDelta,
      crossDelta: 0,
      mainOffset: 0,
      crossOffset: 0,
      mainSize,
      crossSize: 100,
      mainitemSize: mainSize,
      crossitemSize: 100
    })

    const vertical = (mainDelta: number): Normalized1D => ({
      mainDelta,
      crossDelta: 0,
      mainOffset: 0,
      crossOffset: 0,
      mainSize,
      crossSize: 100,
      mainitemSize: mainSize,
      crossitemSize: 100
    })

    const horizontalThreshold =
      mainSize * APP_CONFIG.swipeCommitRatio

    const verticalThreshold =
      mainSize * APP_CONFIG.swipeCommitRatio * 0.65

    it('returns null when horizontal delta is below the commit threshold', () => {
      expect(
        carouselUtils.resolveCommit(
          horizontal(horizontalThreshold - 1),
          'horizontal'
        )
      ).toBeNull()
    })

    it('commits when horizontal delta reaches the commit threshold', () => {
      expect(
        carouselUtils.resolveCommit(
          horizontal(horizontalThreshold),
          'horizontal'
        )
      ).toEqual({
        direction: {
          axis: 'horizontal',
          dir: 'right'
        },
        delta: mainSize
      })
    })

    it('commits a negative horizontal delta at the threshold', () => {
      expect(
        carouselUtils.resolveCommit(
          horizontal(-horizontalThreshold),
          'horizontal'
        )
      ).toEqual({
        direction: {
          axis: 'horizontal',
          dir: 'left'
        },
        delta: -mainSize
      })
    })

    it('commits when vertical delta reaches the biased threshold', () => {
      expect(
        carouselUtils.resolveCommit(
          vertical(verticalThreshold),
          'vertical'
        )
      ).toEqual({
        direction: {
          axis: 'vertical',
          dir: 'down'
        },
        delta: mainSize
      })
    })

    it('commits a negative vertical delta at the biased threshold', () => {
      expect(
        carouselUtils.resolveCommit(
          vertical(-verticalThreshold),
          'vertical'
        )
      ).toEqual({
        direction: {
          axis: 'vertical',
          dir: 'up'
        },
        delta: -mainSize
      })
    })

    it('returns undefined when mainDelta is missing at runtime', () => {
      const norm = horizontal(100)
      norm.mainDelta = undefined as never

      expect(
        carouselUtils.resolveCommit(norm, 'horizontal')
      ).toBeUndefined()
    })

    it('returns undefined when mainSize is missing at runtime', () => {
      const norm = horizontal(100)
      norm.mainSize = undefined as never

      expect(
        carouselUtils.resolveCommit(norm, 'horizontal')
      ).toBeUndefined()
    })
  })
})