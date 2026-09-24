import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCascadePlugin } from '../../src/vite/vite.cascade-plugin.ts'

const {
  runCss,
  schedule,
} = vi.hoisted(() => ({
  runCss: vi.fn(),
  schedule: vi.fn(),
}))

vi.mock(
  '../../src/entries/entry.ts',
  () => ({
    compiler: {
      runCss,
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

const remove = (directory: string) => {
  fs.rmSync(directory, {
    recursive: true,
    force: true,
  })
}

describe('[VITE] cascadeCompiler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('configResolved', () => {
    it('initializes the CSS compiler', () => {
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

      expect(runCss).toHaveBeenCalledOnce()
      expect(runCss).toHaveBeenCalledWith(projectRoot)

      remove(projectRoot)
    })

    it('initializes the CSS compiler in build mode', () => {
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
        command: 'build',
      })

      expect(runCss).toHaveBeenCalledOnce()
      expect(runCss).toHaveBeenCalledWith(projectRoot)

      remove(projectRoot)
    })
  })

  describe('transform', () => {
    it('ignores non-CSS files', () => {
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
        command: 'build',
      })

      const result = plugin.transform(
        'const value = 1',
        '/project/src/main.ts',
      )

      expect(result).toBeUndefined()
      expect(
        compiler.handleCssChange,
      ).not.toHaveBeenCalled()

      remove(projectRoot)
    })

    it('processes CSS through the compiler', () => {
      const compiler = createCompiler()
      const projectRoot = createProject()
      const source = '.button { color: red; }'
      const cssPath = '/project/src/button.css'

      compiler.handleCssChange.mockReturnValue(source)

      runCss.mockReturnValue({
        compiler,
        tokenFolder: '/tokens',
      })

      const plugin = asTestPlugin(
        createCascadePlugin(projectRoot),
      )

      plugin.configResolved({
        command: 'build',
      })

      const result = plugin.transform(
        source,
        cssPath,
      )

      expect(
        compiler.handleCssChange,
      ).toHaveBeenCalledOnce()

      expect(
        compiler.handleCssChange,
      ).toHaveBeenCalledWith(
        cssPath,
        source,
      )

      expect(result).toBe(source)

      remove(projectRoot)
    })

    it('schedules finalization in serve mode', () => {
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

      plugin.transform(
        '.button {}',
        '/project/src/button.css',
      )

      expect(schedule).toHaveBeenCalledOnce()

      remove(projectRoot)
    })

    it('does not schedule finalization in build mode', () => {
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
        command: 'build',
      })

      plugin.transform(
        '.button {}',
        '/project/src/button.css',
      )

      expect(schedule).not.toHaveBeenCalled()

      remove(projectRoot)
    })
  })

  describe('configureServer', () => {
    it('does nothing in build mode', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()
      const projectRoot = createProject()

      runCss.mockReturnValue({
        compiler,
        tokenFolder: '/tokens',
      })

      const plugin = asTestPlugin(
        createCascadePlugin(projectRoot),
      )

      plugin.configResolved({
        command: 'build',
      })

      plugin.configureServer({ watcher })

      expect(watcher.on).not.toHaveBeenCalled()

      remove(projectRoot)
    })

    it('registers a change watcher in serve mode', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()
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

      plugin.configureServer({ watcher })

      expect(watcher.on).toHaveBeenCalledOnce()
      expect(watcher.on).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )

      remove(projectRoot)
    })

    it('ignores changes outside the token folder', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()
      const projectRoot = createProject()
      const tokenFolder = fs.mkdtempSync(
        path.join(tmpdir(), 'token-folder-'),
      )

      runCss.mockReturnValue({
        compiler,
        tokenFolder,
      })

      const plugin = asTestPlugin(
        createCascadePlugin(projectRoot),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.configureServer({ watcher })

      const onChange = watcher.on.mock.calls[0][1]

      onChange(
        path.join(
          tokenFolder,
          '..',
          'other.jsonc',
        ),
      )

      expect(
        compiler.handleTokenChange,
      ).not.toHaveBeenCalled()

      remove(projectRoot)
      remove(tokenFolder)
    })

    it('handles token changes and touches the CSS file', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()
      const projectRoot = createProject()
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

      const utimesSync = vi.spyOn(
        fs,
        'utimesSync',
      )

      const plugin = asTestPlugin(
        createCascadePlugin(projectRoot),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.configureServer({ watcher })

      const onChange = watcher.on.mock.calls[0][1]

      onChange(tokenPath)

      expect(
        compiler.handleTokenChange,
      ).toHaveBeenCalledOnce()

      expect(
        compiler.handleTokenChange,
      ).toHaveBeenCalledWith(tokenPath)

      expect(utimesSync).toHaveBeenCalledOnce()

      expect(utimesSync).toHaveBeenCalledWith(
        cssPath,
        expect.any(Date),
        expect.any(Date),
      )

      utimesSync.mockRestore()

      remove(projectRoot)
      remove(tokenFolder)
    })

    it('does not touch CSS when no CSS path is returned', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()
      const projectRoot = createProject()
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

      const utimesSync = vi.spyOn(
        fs,
        'utimesSync',
      )

      const plugin = asTestPlugin(
        createCascadePlugin(projectRoot),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.configureServer({ watcher })

      const onChange = watcher.on.mock.calls[0][1]

      onChange(tokenPath)

      expect(
        compiler.handleTokenChange,
      ).toHaveBeenCalledOnce()

      expect(
        compiler.handleTokenChange,
      ).toHaveBeenCalledWith(tokenPath)

      expect(utimesSync).not.toHaveBeenCalled()

      utimesSync.mockRestore()

      remove(projectRoot)
      remove(tokenFolder)
    })

    it('does not touch CSS when the CSS file does not exist', () => {
      const compiler = createCompiler()
      const watcher = createWatcher()
      const projectRoot = createProject()
      const tokenFolder = fs.mkdtempSync(
        path.join(tmpdir(), 'token-folder-'),
      )

      const tokenPath = path.join(
        tokenFolder,
        'colors.jsonc',
      )

      const cssPath = path.join(
        tokenFolder,
        'missing.css',
      )

      fs.writeFileSync(tokenPath, '{}')

      compiler.handleTokenChange.mockReturnValue(cssPath)

      runCss.mockReturnValue({
        compiler,
        tokenFolder,
      })

      const utimesSync = vi.spyOn(
        fs,
        'utimesSync',
      )

      const plugin = asTestPlugin(
        createCascadePlugin(projectRoot),
      )

      plugin.configResolved({
        command: 'serve',
      })

      plugin.configureServer({ watcher })

      const onChange = watcher.on.mock.calls[0][1]

      onChange(tokenPath)

      expect(
        compiler.handleTokenChange,
      ).toHaveBeenCalledOnce()

      expect(
        compiler.handleTokenChange,
      ).toHaveBeenCalledWith(tokenPath)

      expect(utimesSync).not.toHaveBeenCalled()

      utimesSync.mockRestore()

      remove(projectRoot)
      remove(tokenFolder)
    })
  })
})