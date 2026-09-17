import type { FSWatcher } from 'chokidar'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { watchContent } from '../../../src/entries/watch/watchers/watchContent.ts'

const watchMock = vi.hoisted(() => vi.fn())
const whatChangedMock = vi.hoisted(() => vi.fn())

vi.mock('chokidar', () => ({
  default: {
    watch: watchMock,
  },
}))

vi.mock(
  '../../../src/entries/watch/watchers/resolveChange.ts',
  () => ({
    whatChanged: whatChangedMock,
  }),
)

const watcher = {
  on: vi.fn(),
} as unknown as FSWatcher

const compiler = {
  handleCssChange: vi.fn(),
  handleTokenChange: vi.fn(),
  finalize: vi.fn(),
}

describe('[ENTRIES > WATCH > WATCHERS]', () => {
  describe('watchContent', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      watchMock.mockReturnValue(watcher)
    })

    it('watches the project root', () => {
      watchContent(
        {
          projectRoot: '/project',
          tokenPath: '/project/tokens',
        },
        compiler,
      )

      expect(watchMock).toHaveBeenCalledWith(
        '/project',
        { ignoreInitial: true },
      )
    })

    it('returns the watcher', () => {
      expect(
        watchContent(
          {
            projectRoot: '/project',
            tokenPath: '/project/tokens',
          },
          compiler,
        ),
      ).toBe(watcher)
    })

    it('handles CSS changes and finalizes', () => {
      whatChangedMock.mockReturnValue('CSS')

      watchContent(
        {
          projectRoot: '/project',
          tokenPath: '/project/tokens',
        },
        compiler,
      )

      const changeHandler = vi.mocked(watcher.on).mock.calls[0][1]

      changeHandler('/project/src/styles.css')

      expect(compiler.handleCssChange).toHaveBeenCalledWith(
        '/project/src/styles.css',
      )
      expect(compiler.finalize).toHaveBeenCalledOnce()
      expect(compiler.handleTokenChange).not.toHaveBeenCalled()
    })

    it('handles token changes and finalizes', () => {
      whatChangedMock.mockReturnValue('TOKEN')

      watchContent(
        {
          projectRoot: '/project',
          tokenPath: '/project/tokens',
        },
        compiler,
      )

      const changeHandler = vi.mocked(watcher.on).mock.calls[0][1]

      changeHandler('/project/tokens/colors.json')

      expect(compiler.handleTokenChange).toHaveBeenCalledWith(
        '/project/tokens/colors.json',
      )
      expect(compiler.finalize).toHaveBeenCalledOnce()
      expect(compiler.handleCssChange).not.toHaveBeenCalled()
    })

    it('does nothing for unsupported changes', () => {
      whatChangedMock.mockReturnValue(null)

      watchContent(
        {
          projectRoot: '/project',
          tokenPath: '/project/tokens',
        },
        compiler,
      )

      const changeHandler = vi.mocked(watcher.on).mock.calls[0][1]

      changeHandler('/project/src/main.ts')

      expect(compiler.handleCssChange).not.toHaveBeenCalled()
      expect(compiler.handleTokenChange).not.toHaveBeenCalled()
      expect(compiler.finalize).not.toHaveBeenCalled()
    })
  })
})