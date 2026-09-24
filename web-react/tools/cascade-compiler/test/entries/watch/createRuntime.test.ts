import type { FSWatcher } from 'chokidar'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRuntime } from '../../../src/entries/watch/createRuntime.ts'

const resolveConfigMock = vi.hoisted(() => vi.fn())
const initializeCompilerMock = vi.hoisted(() => vi.fn())
const watchContentMock = vi.hoisted(() => vi.fn())
const watchConfigMock = vi.hoisted(() => vi.fn())

vi.mock(
  '../../../src/entries/config/resolveConfig.ts',
  () => ({
    resolveConfig: resolveConfigMock,
  }),
)

vi.mock(
  '../../../src/compiler/compilerService.ts',
  () => ({
    initializeCompiler: initializeCompilerMock,
  }),
)

vi.mock(
  '../../../src/entries/watch/watchers/watchContent.ts',
  () => ({
    watchContent: watchContentMock,
  }),
)

vi.mock(
  '../../../src/entries/watch/watchers/watchConfig.ts',
  () => ({
    watchConfig: watchConfigMock,
  }),
)

const contentWatcher = {
  close: vi.fn(),
} as unknown as FSWatcher

const configWatcher = {
  close: vi.fn(),
} as unknown as FSWatcher

const compiler = {}

const config = {
  projectRoot: '/project',
}

const configData = {
  config,
  issues: [],
}

describe('[ENTRIES > WATCH]', () => {
  describe('createRuntime', () => {
    beforeEach(() => {
      vi.clearAllMocks()

      resolveConfigMock.mockReturnValue(configData)
      initializeCompilerMock.mockReturnValue(compiler)
      watchContentMock.mockReturnValue(contentWatcher)
      watchConfigMock.mockReturnValue(configWatcher)
    })

    it('creates a runtime with the compiler and watchers', () => {
      const onConfigChange = vi.fn()

      const runtime = createRuntime(
        '/project',
        onConfigChange,
      )

      expect(runtime).toEqual({
        compiler,
        contentWatcher,
        configWatcher,
        dispose: expect.any(Function),
      })
    })

    it('resolves config without CSS emission', () => {
      createRuntime('/project', vi.fn())

      expect(resolveConfigMock).toHaveBeenCalledWith(
        '/project',
        { willEmitCss: false },
      )
    })

    it('initializes the compiler with the resolved config', () => {
      createRuntime('/project', vi.fn())

      expect(initializeCompilerMock).toHaveBeenCalledWith(configData)
    })

    it('creates the content watcher with the compiler', () => {
      createRuntime('/project', vi.fn())

      expect(watchContentMock).toHaveBeenCalledWith(
        config,
        compiler,
      )
    })

    it('creates the config watcher with the project root and callback', () => {
      const onConfigChange = vi.fn()

      createRuntime('/project', onConfigChange)

      expect(watchConfigMock).toHaveBeenCalledWith(
        config.projectRoot,
        onConfigChange,
      )
    })

    it('disposes both watchers', async () => {
      const runtime = createRuntime('/project', vi.fn())

      await runtime?.dispose()

      expect(contentWatcher.close).toHaveBeenCalledOnce()
      expect(configWatcher.close).toHaveBeenCalledOnce()
    })
  })
})