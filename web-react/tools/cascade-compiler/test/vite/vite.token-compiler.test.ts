import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCascadePlugin } from '../../src/vite/vite.cascade-plugin.ts'

const {
  runCss,
  runBuild,
  schedule,
} = vi.hoisted(() => ({
  runCss: vi.fn(),
  runBuild: vi.fn(),
  schedule: vi.fn(),
}))

vi.mock(
  '../../src/entries/entry.ts',
  () => ({
    compiler: {
      runCss,
      runBuild,
    },
  }),
)

vi.mock(
  '../../src/vite/helpers/finalizeScheduler.ts',
  () => ({
    createFinalizeScheduler: () => ({
      schedule,
    }),
  }),
)

type TestWatcher = {
  on: ReturnType<typeof vi.fn>
}

type TestPlugin = {
  configResolved: (config: {
    command: 'serve' | 'build'
  }) => void
  transform: (code: string, id: string) => unknown
  buildEnd: () => void
  configureServer: (server: {
    watcher: TestWatcher
  }) => void
}

const asTestPlugin = (
  plugin: ReturnType<typeof createCascadePlugin>,
): TestPlugin => plugin as unknown as TestPlugin

const createWatcher = () => ({
  on: vi.fn(),
})

const createProject = () => {
  return fs.mkdtempSync(
    path.join(tmpdir(), 'cascade-compiler-test-'),
  )
}

const createCompiler = () => ({
  handleCssChange: vi.fn(),
  handleTokenChange: vi.fn(),
  finalize: vi.fn(),
})

describe('[VITE] cascadeCompiler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('configResolved', () => {
    it('initializes the CSS compiler in serve mode', () => {
      const compiler = createCompiler()
      const projectRoot = createProject()

      runCss.mockReturnValue({
        compiler,
        tokenFolder: '/tokens',
      })

      const plugin = asTestPlugin(
        createCascadePlugin(projectRoot),
      )

      plugin.configResolved({
        command: 'serve',
      })

      expect(runCss).toHaveBeenCalledWith(projectRoot)
      expect(runBuild).not.toHaveBeenCalled()
    })

    it('initializes the build compiler in build mode', () => {
      const compiler = createCompiler()
      const projectRoot = createProject()

      runBuild.mockReturnValue(compiler)

      const plugin = asTestPlugin(
        createCascadePlugin(projectRoot),
      )

      plugin.configResolved({
        command: 'build',
      })

      expect(runBuild).toHaveBeenCalledWith(projectRoot)
      expect(runCss).not.toHaveBeenCalled()
    })
  })

  describe('transform', () => {
    it('ignores non-CSS files', () => {
      const compiler = createCompiler()

      runBuild.mockReturnValue(compiler)

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'build',
      })

      const result = plugin.transform(
        'const value = 1',
        '/project/src/main.ts',
      )

      expect(result).toBeUndefined()
      expect(compiler.handleCssChange).not.toHaveBeenCalled()
    })

    it('processes CSS through the compiler', () => {
      const compiler = createCompiler()
      const source = '.button { color: red; }'
      const cssPath = '/project/src/button.css'

      compiler.handleCssChange.mockReturnValue(source)
      runBuild.mockReturnValue(compiler)

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'build',
      })

      const result = plugin.transform(
        source,
        cssPath,
      )

      expect(compiler.handleCssChange).toHaveBeenCalledWith(
        cssPath,
        source,
      )

      expect(result).toBe(source)
    })

    it('schedules finalization in serve mode', () => {
      const compiler = createCompiler()

      runCss.mockReturnValue({
        compiler,
        tokenFolder: '/tokens',
      })

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.transform(
        '.button {}',
        '/project/src/button.css',
      )

      expect(schedule).toHaveBeenCalledOnce()
    })

    it('does not schedule finalization in build mode', () => {
      const compiler = createCompiler()

      runBuild.mockReturnValue(compiler)

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'build',
      })

      plugin.transform(
        '.button {}',
        '/project/src/button.css',
      )

      expect(schedule).not.toHaveBeenCalled()
    })
  })

  describe('buildEnd', () => {
    it('finalizes after a build', () => {
      const compiler = createCompiler()

      runBuild.mockReturnValue(compiler)

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'build',
      })

      plugin.buildEnd()

      expect(compiler.finalize).toHaveBeenCalledOnce()
    })

    it('does not finalize in serve mode', () => {
      const compiler = createCompiler()

      runCss.mockReturnValue({
        compiler,
        tokenFolder: '/tokens',
      })

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.buildEnd()

      expect(compiler.finalize).not.toHaveBeenCalled()
    })
  })

  describe('configureServer', () => {
    it('ignores changes outside the token folder', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()

      runCss.mockReturnValue({
        compiler,
        tokenFolder: '/project/tokens',
      })

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.configureServer({ watcher })

      const onChange = watcher.on.mock.calls[0][1]

      onChange('/project/src/other.jsonc')

      expect(compiler.handleTokenChange)
        .not.toHaveBeenCalled()
    })

    it('handles token changes and touches the CSS file', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()

      const tokenFolder = fs.mkdtempSync(
        path.join(tmpdir(), 'token-folder-'),
      )

      const tokenPath = path.join(
        tokenFolder,
        'colors.jsonc',
      )

      const cssPath = path.join(
        tokenFolder,
        'colors.css',
      )

      fs.writeFileSync(tokenPath, '{}')
      fs.writeFileSync(cssPath, '.button {}')

      compiler.handleTokenChange.mockReturnValue(cssPath)

      runCss.mockReturnValue({
        compiler,
        tokenFolder,
      })

      const utimesSync = vi.spyOn(fs, 'utimesSync')

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.configureServer({ watcher })

      const onChange = watcher.on.mock.calls[0][1]

      onChange(tokenPath)

      expect(compiler.handleTokenChange)
        .toHaveBeenCalledWith(tokenPath)

      expect(utimesSync).toHaveBeenCalledWith(
        cssPath,
        expect.any(Date),
        expect.any(Date),
      )

      utimesSync.mockRestore()

      fs.rmSync(tokenFolder, {
        recursive: true,
        force: true,
      })
    })

    it('does not touch CSS when no CSS path is returned', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()

      const tokenFolder = fs.mkdtempSync(
        path.join(tmpdir(), 'token-folder-'),
      )

      const tokenPath = path.join(
        tokenFolder,
        'colors.jsonc',
      )

      fs.writeFileSync(tokenPath, '{}')

      compiler.handleTokenChange.mockReturnValue(null)

      runCss.mockReturnValue({
        compiler,
        tokenFolder,
      })

      const utimesSync = vi.spyOn(fs, 'utimesSync')

      const plugin = asTestPlugin(
        createCascadePlugin(createProject()),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.configureServer({ watcher })

      const onChange = watcher.on.mock.calls[0][1]

      onChange(tokenPath)

      expect(compiler.handleTokenChange)
        .toHaveBeenCalledWith(tokenPath)

      expect(utimesSync).not.toHaveBeenCalled()

      utimesSync.mockRestore()

      fs.rmSync(tokenFolder, {
        recursive: true,
        force: true,
      })
    })
  })
})
