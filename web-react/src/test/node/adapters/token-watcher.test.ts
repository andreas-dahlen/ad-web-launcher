import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it, vi, afterEach } from 'vitest'
import type { Plugin, ViteDevServer } from 'vite'

import createTokenWatcherAdapter, {
  __TEST_ONLY_API as isTokenFile
} from '../../../../plugins/adapters/vite.token-watcher-adapter'
import type { TokenCompiler } from '@styleTokens/compiler/compilerService'

const tokenRoot = path.resolve('./src/styleTokens/tokens')

const tokenFile = (name: string) =>
  path.join(tokenRoot, name)

const createServer = (
  on: ReturnType<typeof vi.fn>
) =>
  ({
    watcher: { on }
  }) as unknown as ViteDevServer

const configureServer = (
  plugin: Plugin,
  server: ViteDevServer,
) => {
  if (typeof plugin.configureServer !== 'function') {
    throw new TypeError(
      'Expected configureServer to be a function'
    )
  }

  const hook = plugin.configureServer as (
    server: ViteDevServer
  ) => void

  hook(server)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('[VITE] token-watcher', () => {
  describe('isTokenFile', () => {
    it.each([
      'tokens.json',
      'tokens.jsonc'
    ])('accepts %s files inside the token directory', name => {
      expect(
        isTokenFile.isTokenFile(tokenFile(name))
      ).toBe(true)
    })

    it.each([
      'tokens.ts',
      'tokens.css',
      'tokens.js',
      'tokens.txt'
    ])('rejects %s files inside the token directory', name => {
      expect(
        isTokenFile.isTokenFile(tokenFile(name))
      ).toBe(false)
    })

    it('rejects JSON files outside the token directory', () => {
      expect(
        isTokenFile.isTokenFile(
          path.resolve('./src/other/tokens.json')
        )
      ).toBe(false)
    })

    it('rejects paths that only share the token directory name', () => {
      expect(
        isTokenFile.isTokenFile(
          path.resolve(
            './src/styleTokens/tokens-other/tokens.json'
          )
        )
      ).toBe(false)
    })
  })

  describe('createTokenWatcherAdapter', () => {
    it('registers a change listener', () => {
      const on = vi.fn()

      const tokenCompiler = {
        handleTokenChange: vi.fn()
      } as unknown as TokenCompiler

      const plugin = createTokenWatcherAdapter(tokenCompiler)

      configureServer(plugin, createServer(on))

      expect(on).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('ignores non-token files', () => {
      const on = vi.fn()
      const handleTokenChange = vi.fn()

      const tokenCompiler = {
        handleTokenChange
      } as unknown as TokenCompiler

      const plugin = createTokenWatcherAdapter(tokenCompiler)

      configureServer(plugin, createServer(on))

      const changeHandler = on.mock.calls[0][1]

      changeHandler(
        path.resolve(
          './src/styleTokens/tokens/example.ts'
        )
      )

      expect(handleTokenChange).not.toHaveBeenCalled()
    })

    it('ignores token changes when no CSS path is returned', () => {
      const on = vi.fn()
      const handleTokenChange = vi.fn(
        () => { }
      )

      const tokenCompiler = {
        handleTokenChange
      } as unknown as TokenCompiler

      const plugin = createTokenWatcherAdapter(tokenCompiler)

      configureServer(plugin, createServer(on))

      const changeHandler = on.mock.calls[0][1]

      changeHandler(
        tokenFile('tokens.json')
      )

      expect(handleTokenChange).toHaveBeenCalledWith(
        tokenFile('tokens.json')
      )
    })

    it('ignores token changes when the generated CSS file does not exist', () => {
      const on = vi.fn()
      const cssPath = '/generated/tokens.css'

      const handleTokenChange = vi.fn(
        () => cssPath
      )

      const tokenCompiler = {
        handleTokenChange
      } as unknown as TokenCompiler

      vi.spyOn(fs, 'existsSync')
        .mockReturnValue(false)

      const utimesSync = vi
        .spyOn(fs, 'utimesSync')
        .mockImplementation(() => { })

      const plugin = createTokenWatcherAdapter(tokenCompiler)

      configureServer(plugin, createServer(on))

      const changeHandler = on.mock.calls[0][1]

      changeHandler(
        tokenFile('tokens.json')
      )

      expect(utimesSync).not.toHaveBeenCalled()
    })

    it('touches the generated CSS file when it exists', () => {
      const on = vi.fn()
      const cssPath = '/generated/tokens.css'

      const handleTokenChange = vi.fn(
        () => cssPath
      )

      const tokenCompiler = {
        handleTokenChange
      } as unknown as TokenCompiler

      vi.spyOn(fs, 'existsSync')
        .mockReturnValue(true)

      const utimesSync = vi
        .spyOn(fs, 'utimesSync')
        .mockImplementation(() => { })

      const plugin = createTokenWatcherAdapter(tokenCompiler)

      configureServer(plugin, createServer(on))

      const changeHandler = on.mock.calls[0][1]

      changeHandler(
        tokenFile('tokens.json')
      )

      expect(utimesSync).toHaveBeenCalledWith(
        cssPath,
        expect.any(Date),
        expect.any(Date)
      )
    })
  })
})