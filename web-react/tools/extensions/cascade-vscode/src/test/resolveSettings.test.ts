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

const resolveMock = vi.hoisted(() =>
  vi.fn(),
)

const existsSyncMock = vi.hoisted(() =>
  vi.fn(),
)

const readFileSyncMock = vi.hoisted(() =>
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

vi.mock('node:module', () => ({
  createRequire: () => ({
    resolve: resolveMock,
  }),
}))

vi.mock('node:fs', () => ({
  default: {
    existsSync: existsSyncMock,
    readFileSync: readFileSyncMock,
  },
}))

import { createSettingsResolver } from '../config/resolveSettings.ts'

describe(
  '[Cascade] createSettingsResolver',
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
        },
      )

      resolveMock.mockReturnValue(
        '/workspace/web-react/node_modules/cascade/index.js',
      )

      existsSyncMock.mockReturnValue(true)

      readFileSyncMock.mockReturnValue(
        JSON.stringify({
          name: 'cascade',
        }),
      )
    })

    it('resolves the project root', () => {
      const resolver =
        createSettingsResolver(
          settings as never,
          output as never,
        )

      expect(
        resolver.getProjectRootArg(),
      ).toBe('/workspace/web-react')
    })

    it('resolves the installed Cascade CLI', () => {
      const resolver =
        createSettingsResolver(
          settings as never,
          output as never,
        )

      expect(
        resolver.getCliSpawnPath(),
      ).toBe(
        '/workspace/web-react/node_modules/cascade/dist/cli.js',
      )

      expect(resolveMock).toHaveBeenCalledWith(
        'cascade',
        {
          paths: ['/workspace/web-react'],
        },
      )
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
      expect(resolveMock).not.toHaveBeenCalled()
    })

    it('throws when projectRoot is missing', () => {
      get.mockImplementation(
        (key: string) => {
          if (key === 'projectRoot') {
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
        'ERROR: projectRoot setting is missing',
      )

      expect(resolveMock).not.toHaveBeenCalled()
    })

    it('resolves nested project roots', () => {
      get.mockReturnValue('projects/web-react')

      joinPathMock.mockReturnValue({
        fsPath: '/workspace/projects/web-react',
      })

      resolveMock.mockReturnValue(
        '/workspace/projects/web-react/node_modules/cascade/index.js',
      )

      const resolver =
        createSettingsResolver(
          settings as never,
          output as never,
        )

      expect(
        resolver.getProjectRootArg(),
      ).toBe('/workspace/projects/web-react')

      expect(
        resolver.getCliSpawnPath(),
      ).toBe(
        '/workspace/projects/web-react/node_modules/cascade/dist/cli.js',
      )
    })
  },
)