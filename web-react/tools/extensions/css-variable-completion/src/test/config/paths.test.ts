import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const existsSyncMock = vi.hoisted(() =>
  vi.fn(),
)

const readFileSyncMock = vi.hoisted(() =>
  vi.fn(),
)

const resolveMock = vi.hoisted(() =>
  vi.fn(),
)

const fileMock = vi.hoisted(() =>
  vi.fn(),
)

const getConfigMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('node:fs', () => ({
  default: {
    existsSync: existsSyncMock,
    readFileSync: readFileSyncMock,
  },
}))

vi.mock('node:module', () => ({
  createRequire: () => ({
    resolve: resolveMock,
  }),
}))

vi.mock('vscode', () => ({
  Uri: {
    file: fileMock,
  },
}))

vi.mock('../../config/getConfig.ts', () => ({
  getConfig: getConfigMock,
}))

import {
  resolveCascadeRoot,
  resolveLspPath,
  resolveVariablesUri,
} from '../../config/paths.ts'

describe(
  '[CSS Variable Completion] paths',
  () => {
    const appendLine = vi.fn()

    const output = {
      appendLine,
    }

    beforeEach(() => {
      vi.clearAllMocks()

      getConfigMock.mockReturnValue(
        '/workspace/node_modules',
      )

      resolveMock.mockReturnValue(
        '/workspace/node_modules/cascade/dist/index.js',
      )

      fileMock.mockImplementation(
        (filePath: string) => ({
          fsPath: filePath,
        }),
      )
    })

    describe('resolveCascadeRoot', () => {
      it('returns undefined when configuration is missing', () => {
        getConfigMock.mockReturnValue(undefined)

        expect(
          resolveCascadeRoot(output as never),
        ).toBeUndefined()

        expect(resolveMock).not.toHaveBeenCalled()
      })

      it('resolves the Cascade package root', () => {
        existsSyncMock.mockImplementation(
          (packagePath: string) =>
            packagePath ===
            '/workspace/node_modules/cascade/dist/package.json' ||
            packagePath ===
            '/workspace/node_modules/cascade/package.json',
        )

        readFileSyncMock.mockImplementation(
          (packagePath: string) => {
            if (
              packagePath ===
              '/workspace/node_modules/cascade/dist/package.json'
            ) {
              return JSON.stringify({
                name: 'cascade-dist',
              })
            }

            return JSON.stringify({
              name: 'cascade',
            })
          },
        )

        expect(
          resolveCascadeRoot(output as never),
        ).toBe(
          '/workspace/node_modules/cascade',
        )

        expect(resolveMock).toHaveBeenCalledWith(
          'cascade',
          {
            paths: ['/workspace/node_modules'],
          },
        )

        expect(appendLine).toHaveBeenCalledWith(
          'Cascade entry: /workspace/node_modules/cascade/dist/index.js',
        )
      })

      it('returns the first matching Cascade package root', () => {
        existsSyncMock.mockReturnValue(true)

        readFileSyncMock
          .mockReturnValueOnce(
            JSON.stringify({
              name: 'cascade',
            }),
          )

        expect(
          resolveCascadeRoot(output as never),
        ).toBe(
          '/workspace/node_modules/cascade/dist',
        )

        expect(readFileSyncMock).toHaveBeenCalledTimes(1)
      })

      it('returns undefined when the package root cannot be found', () => {
        existsSyncMock.mockReturnValue(false)

        expect(
          resolveCascadeRoot(output as never),
        ).toBeUndefined()

        expect(readFileSyncMock).not.toHaveBeenCalled()
      })

      it('returns undefined when Cascade resolution fails', () => {
        const error = new Error('module not found')

        resolveMock.mockImplementation(() => {
          throw error
        })

        expect(
          resolveCascadeRoot(output as never),
        ).toBeUndefined()

        expect(appendLine).toHaveBeenCalledWith(
          `Cascade resolution failed: ${error}`,
        )
      })

      it('continues when a package is not Cascade', () => {
        existsSyncMock.mockReturnValue(true)

        readFileSyncMock
          .mockReturnValueOnce(
            JSON.stringify({
              name: 'other-package',
            }),
          )
          .mockReturnValueOnce(
            JSON.stringify({
              name: 'cascade',
            }),
          )

        expect(
          resolveCascadeRoot(output as never),
        ).toBe(
          '/workspace/node_modules/cascade',
        )

        expect(readFileSyncMock).toHaveBeenCalledTimes(2)
      })
    })

    describe('resolveVariablesUri', () => {
      it('resolves the extension metadata path', () => {
        expect(
          resolveVariablesUri('/workspace/cascade'),
        ).toEqual({
          fsPath:
            '/workspace/cascade/generated/metadata/extension.jsonc',
        })

        expect(fileMock).toHaveBeenCalledWith(
          '/workspace/cascade/generated/metadata/extension.jsonc',
        )
      })
    })

    describe('resolveLspPath', () => {
      it('resolves the LSP metadata path', () => {
        expect(
          resolveLspPath('/workspace/cascade'),
        ).toEqual({
          fsPath:
            '/workspace/cascade/generated/metadata/lsp.ts',
        })

        expect(fileMock).toHaveBeenCalledWith(
          '/workspace/cascade/generated/metadata/lsp.ts',
        )
      })
    })
  },
)