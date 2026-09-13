import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const workspaceFolders = vi.hoisted(
  () => [] as unknown[],
)

const joinPathMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({
  Uri: {
    joinPath: joinPathMock,
  },

  workspace: {
    get workspaceFolders() {
      return workspaceFolders.length > 0
        ? workspaceFolders
        : undefined
    },
  },
}))

import { createSettingsResolver } from '../config/resolveSettings.ts'

describe(
  '[Token Compiler] createSettingsResolver',
  () => {
    const appendLine = vi.fn()

    const output = {
      appendLine,
    }

    const get = vi.fn()

    const settings = {
      get,
    }

    beforeEach(() => {
      vi.clearAllMocks()

      workspaceFolders.length = 0
      workspaceFolders.push({
        uri: {
          fsPath: '/workspace',
        },
      })

      joinPathMock.mockReturnValue({
        fsPath: '/workspace/web-react',
      })

      get.mockImplementation(
        (key: string) => {
          if (key === 'projectRoot') {
            return 'web-react'
          }

          if (key === 'cliFile') {
            return 'tools/token-compiler/dist/cli.js'
          }

          if (key === 'tokenFolder') {
            return 'src/styleTokens/tokens'
          }
        },
      )
    })

    it('resolves the CLI path', () => {
      const resolver =
        createSettingsResolver(
          settings as never,
          output as never,
        )

      expect(
        resolver.getCliSpawnPath(),
      ).toBe(
        '/workspace/web-react/tools/token-compiler/dist/cli.js',
      )
    })

    it('resolves the project root argument', () => {
      const resolver =
        createSettingsResolver(
          settings as never,
          output as never,
        )

      expect(
        resolver.getProjectRootArg(),
      ).toBe('../..')
    })

    it('returns the configured token folder', () => {
      const resolver =
        createSettingsResolver(
          settings as never,
          output as never,
        )

      expect(
        resolver.getUserOptions(),
      ).toBe('src/styleTokens/tokens')
    })

    it('returns undefined when tokenFolder is missing', () => {
      get.mockImplementation(
        (key: string) => {
          if (key === 'projectRoot') {
            return 'web-react'
          }

          if (key === 'cliFile') {
            return 'tools/token-compiler/dist/cli.js'
          }
        },
      )

      const resolver =
        createSettingsResolver(
          settings as never,
          output as never,
        )

      expect(
        resolver.getUserOptions(),
      ).toBeUndefined()
    })

    it('throws when the workspace folder is missing', () => {
      workspaceFolders.length = 0

      expect(() =>
        createSettingsResolver(
          settings as never,
          output as never,
        ),
      ).toThrow()

      expect(appendLine).toHaveBeenCalledWith(
        'ERROR: workspace folder is missing',
      )

      expect(get).not.toHaveBeenCalled()
    })

    it('throws when projectRoot is missing', () => {
      get.mockImplementation(
        (key: string) => {
          if (key === 'projectRoot') {
            return
          }

          if (key === 'cliFile') {
            return 'tools/token-compiler/dist/cli.js'
          }
        },
      )

      expect(() =>
        createSettingsResolver(
          settings as never,
          output as never,
        ),
      ).toThrow()

      expect(appendLine).toHaveBeenCalledWith(
        'ERROR: projectRoot setting is missing',
      )
    })

    it('throws when cliFile is missing', () => {
      get.mockImplementation(
        (key: string) => {
          if (key === 'projectRoot') {
            return 'web-react'
          }

          if (key === 'cliFile') {
            return
          }
        },
      )

      expect(() =>
        createSettingsResolver(
          settings as never,
          output as never,
        ),
      ).toThrow()

      expect(appendLine).toHaveBeenCalledWith(
        'ERROR: cliFile setting is missing',
      )
    })
  },
)