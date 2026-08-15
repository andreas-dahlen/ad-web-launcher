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

      const state = tracker.__TEST_ONLY_API()

      expect(state.expectedPaths).toEqual(
        new Set([
          'button.module.css',
          'surface.module.css',
        ])
      )

      expect(state.processedPaths).toEqual(new Set())
      expect(state.failedPaths).toEqual(new Set())
      expect(tracker.tokensSucceeded()).toBe(false)
    })

    it('succeeds when there are no expected paths', () => {
      const tracker = createProcessingTracker([])

      expect(tracker.tokensSucceeded()).toBe(true)
    })

    it('marks an expected path as processed', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markProcessed('button.module.css')

      const state = tracker.__TEST_ONLY_API()

      expect(state.processedPaths).toEqual(
        new Set(['button.module.css'])
      )

      expect(state.failedPaths).toEqual(new Set())
      expect(tracker.tokensSucceeded()).toBe(true)
    })

    it('does not succeed until every expected path is resolved', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
        'surface.module.css',
      ])

      tracker.markProcessed('button.module.css')

      expect(tracker.tokensSucceeded()).toBe(false)

      tracker.markProcessed('surface.module.css')

      expect(tracker.tokensSucceeded()).toBe(true)
    })

    it('marks an expected path as a failure', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('button.module.css')

      const state = tracker.__TEST_ONLY_API()

      expect(state.failedPaths).toEqual(
        new Set(['button.module.css'])
      )

      expect(state.processedPaths).toEqual(new Set())
      expect(tracker.tokensSucceeded()).toBe(false)
    })

    it('does not mark an unexpected path as a failure', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('surface.module.css')

      const state = tracker.__TEST_ONLY_API()

      expect(state.failedPaths).toEqual(new Set())
      expect(state.processedPaths).toEqual(new Set())
      expect(tracker.tokensSucceeded()).toBe(false)
    })

    it('replaces a failure when the path is processed successfully', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('button.module.css')
      tracker.markProcessed('button.module.css')

      const state = tracker.__TEST_ONLY_API()

      expect(state.processedPaths).toEqual(
        new Set(['button.module.css'])
      )

      expect(state.failedPaths).toEqual(new Set())
      expect(tracker.tokensSucceeded()).toBe(true)
    })

    it('invalidates a processed path', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markProcessed('button.module.css')

      expect(tracker.tokensSucceeded()).toBe(true)

      tracker.invalidate('button.module.css')

      const state = tracker.__TEST_ONLY_API()

      expect(state.expectedPaths).toEqual(
        new Set(['button.module.css'])
      )

      expect(state.processedPaths).toEqual(new Set())
      expect(state.failedPaths).toEqual(new Set())
      expect(tracker.tokensSucceeded()).toBe(false)
    })

    it('invalidates a failed path', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('button.module.css')

      expect(tracker.tokensSucceeded()).toBe(false)

      tracker.invalidate('button.module.css')

      const state = tracker.__TEST_ONLY_API()

      expect(state.processedPaths).toEqual(new Set())
      expect(state.failedPaths).toEqual(new Set())
      expect(tracker.tokensSucceeded()).toBe(false)
    })

    it('adds a new path when invalidating an unknown path', () => {
      const tracker = createProcessingTracker([])

      tracker.invalidate('button.module.css')

      const state = tracker.__TEST_ONLY_API()

      expect(state.expectedPaths).toEqual(
        new Set(['button.module.css'])
      )

      expect(tracker.tokensSucceeded()).toBe(false)
    })

    it('does not expose mutable internal sets', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markProcessed('button.module.css')

      const state = tracker.__TEST_ONLY_API()

      state.expectedPaths.clear()
      state.processedPaths.clear()
      state.failedPaths.add('fake.module.css')

      const nextState = tracker.__TEST_ONLY_API()

      expect(nextState.expectedPaths).toEqual(
        new Set(['button.module.css'])
      )

      expect(nextState.processedPaths).toEqual(
        new Set(['button.module.css'])
      )

      expect(nextState.failedPaths).toEqual(new Set())
    })

    it('does not succeed when any expected path has failed', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
        'surface.module.css',
        'layout.module.css',
      ])

      tracker.markProcessed('button.module.css')
      tracker.markMissing('surface.module.css')

      expect(tracker.tokensSucceeded()).toBe(false)

      tracker.markProcessed('layout.module.css')

      expect(tracker.tokensSucceeded()).toBe(false)
    })

    it('succeeds when all expected paths are processed', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
        'surface.module.css',
      ])

      tracker.markProcessed('button.module.css')
      tracker.markProcessed('surface.module.css')

      expect(tracker.tokensSucceeded()).toBe(true)
    })

    it('does not count unrelated failures', () => {
      const tracker = createProcessingTracker([
        'button.module.css',
      ])

      tracker.markMissing('unrelated.module.css')

      const state = tracker.__TEST_ONLY_API()

      expect(state.failedPaths).toEqual(new Set())
      expect(tracker.tokensSucceeded()).toBe(false)
    })

    describe('PostCSS completion', () => {
      it('resolves when all expected paths are already resolved', async () => {
        const tracker = createProcessingTracker([
          'button.module.css',
        ])

        tracker.markProcessed('button.module.css')

        await expect(
          tracker.awaitPostCssCompletion()
        ).resolves.toBeUndefined()
      })

      it('resolves when all expected paths are processed', async () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
          'surface.module.css',
        ])

        const completion = tracker.awaitPostCssCompletion()

        tracker.markProcessed('button.module.css')
        tracker.markProcessed('surface.module.css')

        vi.advanceTimersByTime(1000)

        await expect(completion).resolves.toBeUndefined()
      })

      it('resolves when all expected paths finish with failures', async () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
          'surface.module.css',
        ])

        const completion = tracker.awaitPostCssCompletion()

        tracker.markMissing('button.module.css')
        tracker.markMissing('surface.module.css')

        vi.advanceTimersByTime(1000)

        await expect(completion).resolves.toBeUndefined()
      })

      it('rejects when expected paths remain unresolved', async () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
          'surface.module.css',
        ])

        const completion = tracker.awaitPostCssCompletion()

        vi.advanceTimersByTime(1000)

        await expect(completion).rejects.toThrow(
          'Style token compilation stalled'
        )
      })

      it('reports all unresolved CSS modules when PostCSS stalls', async () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
          'surface.module.css',
          'layout.module.css',
        ])

        const completion = tracker.awaitPostCssCompletion()

        vi.advanceTimersByTime(1000)

        await expect(completion).rejects.toThrow(
          [
            '❌ Style token compilation stalled',
            '',
            'Unresolved CSS modules:',
            '  • button.module.css',
            '  • surface.module.css',
            '  • layout.module.css',
          ].join('\n')
        )
      })

      it('resets the PostCSS flush timer when processing makes progress', async () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
          'surface.module.css',
        ])

        const completion = tracker.awaitPostCssCompletion()

        vi.advanceTimersByTime(900)

        tracker.markProcessed('button.module.css')

        vi.advanceTimersByTime(999)

        expect(
          tracker.__TEST_ONLY_API().processedPaths
        ).toEqual(
          new Set(['button.module.css'])
        )

        tracker.markProcessed('surface.module.css')

        vi.advanceTimersByTime(1000)

        await expect(completion).resolves.toBeUndefined()
      })

      it('resets the PostCSS flush timer when a path is invalidated', async () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
        ])

        tracker.markProcessed('button.module.css')

        const completion = tracker.awaitPostCssCompletion()

        vi.advanceTimersByTime(900)

        tracker.invalidate('button.module.css')

        vi.advanceTimersByTime(999)

        expect(
          tracker.__TEST_ONLY_API().processedPaths
        ).toEqual(new Set())

        const rejection = expect(completion).rejects.toThrow(
          'Style token compilation stalled'
        )

        vi.advanceTimersByTime(1)

        await rejection
      })

      it('resets the PostCSS flush timer when PostCSS activity occurs', async () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
        ])

        const completion = tracker.awaitPostCssCompletion()

        vi.advanceTimersByTime(900)

        tracker.notifyPostCssActivity()

        vi.advanceTimersByTime(999)

        const rejection = expect(completion).rejects.toThrow(
          'Style token compilation stalled'
        )

        vi.advanceTimersByTime(1)

        await rejection
      })

      it('resolves after a failure followed by successful processing', async () => {
        vi.useFakeTimers()

        const tracker = createProcessingTracker([
          'button.module.css',
        ])

        const completion = tracker.awaitPostCssCompletion()

        tracker.markMissing('button.module.css')
        tracker.markProcessed('button.module.css')

        vi.advanceTimersByTime(1000)

        await expect(completion).resolves.toBeUndefined()
      })
    })
  })
})