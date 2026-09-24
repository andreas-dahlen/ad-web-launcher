import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const resolveLspPathMock = vi.hoisted(() =>
  vi.fn(),
)

const watchCssSaveMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({}))

vi.mock('../../config/paths.ts', () => ({
  resolveLspPath: resolveLspPathMock,
}))

vi.mock('../../lsp/watchCssSave.ts', () => ({
  watchCssSave: watchCssSaveMock,
}))

import { lspEntry } from '../../lsp/lspEntry.ts'

describe(
  '[CSS Variable Completion] lspEntry',
  () => {
    const appendLine = vi.fn()

    const output = {
      appendLine,
    }

    const lspUri = {
      fsPath: '/workspace/cascade/generated/metadata/lsp.ts',
    }

    const disposable = {
      dispose: vi.fn(),
    }

    beforeEach(() => {
      vi.clearAllMocks()

      resolveLspPathMock.mockReturnValue(lspUri)
      watchCssSaveMock.mockReturnValue(disposable)
    })

    it('starts the CSS save watcher for the resolved LSP path', () => {
      expect(
        lspEntry('/workspace/cascade', output as never),
      ).toBe(disposable)

      expect(
        resolveLspPathMock,
      ).toHaveBeenCalledWith(
        '/workspace/cascade',
      )

      expect(
        appendLine,
      ).toHaveBeenCalledWith(
        `[css variable completion] lsp path: ${lspUri}`,
      )

      expect(
        watchCssSaveMock,
      ).toHaveBeenCalledWith(
        lspUri,
        output,
      )
    })

    it('returns undefined when the LSP path cannot be resolved', () => {
      resolveLspPathMock.mockReturnValue(undefined)

      expect(
        lspEntry('/workspace/cascade', output as never),
      ).toBeUndefined()

      expect(
        appendLine,
      ).toHaveBeenCalledWith(
        '[css variable completion] could not resolve LSP path.',
      )

      expect(
        watchCssSaveMock,
      ).not.toHaveBeenCalled()
    })
  },
)