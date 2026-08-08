import { afterEach, describe, expect, it, vi } from 'vitest'
import { createProcessingTracker } from '@styleTokens/compiler/tracking/processingTracker'

afterEach(() => {
  vi.useRealTimers()
})

describe('[COMPILER]', () => {
  describe('createProcessingTracker', () => {
    it('starts with all expected paths unresolved', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
        'surface.module.css',
      ])

      const snapshot = tracker.snapshot()

      expect(snapshot.expected).toEqual(
        new Set([
          'button.module.css',
          'surface.module.css',
        ])
      )

      expect(snapshot.processed).toEqual(new Set())
      expect(snapshot.failures).toEqual(new Set())

      expect(tracker.hasFinished()).toBe(false)
      expect(tracker.hasSucceeded()).toBe(false)
    })

    it('is finished when there are no expected paths', () => {
      const tracker = createProcessingTracker([])

      expect(tracker.hasFinished()).toBe(true)
      expect(tracker.hasSucceeded()).toBe(true)
    })

    it('marks an expected path as processed', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markProcessed('button.module.css')

      const snapshot = tracker.snapshot()

      expect(snapshot.processed).toEqual(
        new Set(['button.module.css'])
      )

      expect(snapshot.failures).toEqual(new Set())
      expect(tracker.hasFinished()).toBe(true)
      expect(tracker.hasSucceeded()).toBe(true)
    })

    it('does not finish until every expected path is resolved', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
        'surface.module.css',
      ])

      tracker.markProcessed('button.module.css')

      expect(tracker.hasFinished()).toBe(false)
      expect(tracker.hasSucceeded()).toBe(false)

      tracker.markProcessed('surface.module.css')

      expect(tracker.hasFinished()).toBe(true)
      expect(tracker.hasSucceeded()).toBe(true)
    })

    it('marks an expected path as a failure', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('button.module.css')

      const snapshot = tracker.snapshot()

      expect(snapshot.failures).toEqual(
        new Set(['button.module.css'])
      )

      expect(snapshot.processed).toEqual(new Set())

      expect(tracker.hasFinished()).toBe(true)
      expect(tracker.hasSucceeded()).toBe(false)
    })

    it('does not mark an unexpected path as a failure', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('surface.module.css')

      const snapshot = tracker.snapshot()

      expect(snapshot.failures).toEqual(new Set())
      expect(snapshot.processed).toEqual(new Set())

      expect(tracker.hasFinished()).toBe(false)
      expect(tracker.hasSucceeded()).toBe(false)
    })

    it('replaces a failure when the path is processed successfully', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('button.module.css')
      tracker.markProcessed('button.module.css')

      const snapshot = tracker.snapshot()

      expect(snapshot.processed).toEqual(
        new Set(['button.module.css'])
      )

      expect(snapshot.failures).toEqual(new Set())
      expect(tracker.hasSucceeded()).toBe(true)
    })

    it('invalidates a processed path', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markProcessed('button.module.css')

      expect(tracker.hasSucceeded()).toBe(true)

      tracker.invalidate('button.module.css')

      const snapshot = tracker.snapshot()

      expect(snapshot.expected).toEqual(
        new Set(['button.module.css'])
      )

      expect(snapshot.processed).toEqual(new Set())
      expect(snapshot.failures).toEqual(new Set())

      expect(tracker.hasFinished()).toBe(false)
      expect(tracker.hasSucceeded()).toBe(false)
    })

    it('invalidates a failed path', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('button.module.css')

      expect(tracker.hasFinished()).toBe(true)
      expect(tracker.hasSucceeded()).toBe(false)

      tracker.invalidate('button.module.css')

      const snapshot = tracker.snapshot()

      expect(snapshot.processed).toEqual(new Set())
      expect(snapshot.failures).toEqual(new Set())

      expect(tracker.hasFinished()).toBe(false)
      expect(tracker.hasSucceeded()).toBe(false)
    })

    it('adds a new path when invalidating an unknown path', () => {
      const tracker = createProcessingTracker([])

      tracker.invalidate('button.module.css')

      const snapshot = tracker.snapshot()

      expect(snapshot.expected).toEqual(
        new Set(['button.module.css'])
      )

      expect(tracker.hasFinished()).toBe(false)
      expect(tracker.hasSucceeded()).toBe(false)
    })

    it('does not mutate the sets returned by snapshot', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markProcessed('button.module.css')

      const snapshot = tracker.snapshot()

      snapshot.expected.clear()
      snapshot.processed.clear()
      snapshot.failures.add('fake.module.css')

      const nextSnapshot = tracker.snapshot()

      expect(nextSnapshot.expected).toEqual(
        new Set(['button.module.css'])
      )

      expect(nextSnapshot.processed).toEqual(
        new Set(['button.module.css'])
      )

      expect(nextSnapshot.failures).toEqual(new Set())
    })

    it('requires all expected paths to be resolved for success', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
        'surface.module.css',
        'layout.module.css',
      ])

      tracker.markProcessed('button.module.css')
      tracker.markMissing('surface.module.css')

      expect(tracker.hasFinished()).toBe(false)
      expect(tracker.hasSucceeded()).toBe(false)

      tracker.markProcessed('layout.module.css')

      expect(tracker.hasFinished()).toBe(true)
      expect(tracker.hasSucceeded()).toBe(false)
    })

    it('succeeds when all expected paths are processed', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
        'surface.module.css',
      ])

      tracker.markProcessed('button.module.css')
      tracker.markProcessed('surface.module.css')

      expect(tracker.hasFinished()).toBe(true)
      expect(tracker.hasSucceeded()).toBe(true)
    })

    it('does not count unrelated failures toward completion', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('unrelated.module.css')

      expect(tracker.hasFinished()).toBe(false)
      expect(tracker.hasSucceeded()).toBe(false)
    })

    describe('stall detection', () => {

      it('does not throw when all paths are resolved before the timer fires', () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
        ])

        tracker.markProcessed('button.module.css')

        expect(() => {
          vi.advanceTimersByTime(1000)
        }).not.toThrow()
      })

      it('resets the stall timer whenever progress is made', () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
          'surface.module.css',
        ])

        vi.advanceTimersByTime(900)

        tracker.markProcessed('button.module.css')

        expect(() => {
          vi.advanceTimersByTime(900)
        }).not.toThrow()

        expect(tracker.hasFinished()).toBe(false)

        expect(() => {
          vi.advanceTimersByTime(100)
        }).toThrow()
      })

      it('resets the stall timer when a path is invalidated', () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
        ])

        tracker.markProcessed('button.module.css')

        vi.advanceTimersByTime(900)

        tracker.invalidate('button.module.css')

        expect(() => {
          vi.advanceTimersByTime(900)
        }).not.toThrow()

        expect(tracker.hasFinished()).toBe(false)

        expect(() => {
          vi.advanceTimersByTime(100)
        }).toThrow()
      })
    })
  })
})