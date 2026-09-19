import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { createFinalizeScheduler } from '../../src/vite/helpers/finalizeScheduler.ts'

describe('[VITE]', () => {
  describe('createFinalizeScheduler', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('finalizes after the flush delay', () => {
      const finalize = vi.fn()
      const { schedule } = createFinalizeScheduler(finalize)

      schedule()

      expect(finalize).not.toHaveBeenCalled()

      vi.advanceTimersByTime(499)

      expect(finalize).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)

      expect(finalize).toHaveBeenCalledOnce()
    })

    it('resets the timer when scheduled again', () => {
      const finalize = vi.fn()
      const { schedule } = createFinalizeScheduler(finalize)

      schedule()

      vi.advanceTimersByTime(250)

      schedule()

      vi.advanceTimersByTime(499)

      expect(finalize).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)

      expect(finalize).toHaveBeenCalledOnce()
    })
  })
})