import type { FSWatcher } from 'chokidar'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { watchConfig } from '../../../src/entries/watch/watchers/watchConfig.ts'

const watchMock = vi.hoisted(() => vi.fn())
const onChangeMock = vi.hoisted(() => vi.fn())

const watcher = {
  on: vi.fn(),
} as unknown as FSWatcher

vi.mock('chokidar', () => ({
  default: {
    watch: watchMock,
  },
}))

describe('[ENTRIES > WATCH > WATCHERS]', () => {
  describe('watchConfig', () => {
    beforeEach(() => {
      vi.clearAllMocks()

      watchMock.mockReturnValue(watcher)
    })

    it('watches the project config', () => {
      watchConfig('/project', onChangeMock)

      expect(watchMock).toHaveBeenCalledWith(
        '/project/cascade.config.json',
        { ignoreInitial: true },
      )
    })

    it('returns the watcher', () => {
      expect(
        watchConfig('/project', onChangeMock),
      ).toBe(watcher)
    })

    it('calls onChange when the config changes', async () => {
      watchConfig('/project', onChangeMock)

      const changeHandler = vi.mocked(watcher.on).mock.calls[0][1]

      onChangeMock.mockResolvedValue(undefined)

      changeHandler()

      expect(onChangeMock).toHaveBeenCalledOnce()
    })
  })
})