import { describe, expect, it, vi } from 'vitest'

import { watchCssSave } from '../../lsp/watchCssSave.ts'
import { cssLanguages } from '../../config/languages.ts'

const createFileSystemWatcherMock = vi.hoisted(() =>
  vi.fn(),
)

const onDidSaveTextDocumentMock = vi.hoisted(() =>
  vi.fn(),
)

const disposableFromMock = vi.hoisted(() =>
  vi.fn((...disposables) => ({
    dispose: vi.fn(() => {
      for (const disposable of disposables) {
        disposable.dispose()
      }
    }),
  })),
)

const openLspDocumentMock = vi.hoisted(() =>
  vi.fn(),
)

const nudgeCssModuleMock = vi.hoisted(() =>
  vi.fn(),
)

const watcher = vi.hoisted(() => ({
  onDidChange: vi.fn(),
  dispose: vi.fn(),
}))

vi.mock('vscode', () => ({
  workspace: {
    createFileSystemWatcher:
      createFileSystemWatcherMock,
    onDidSaveTextDocument:
      onDidSaveTextDocumentMock,
  },
  Disposable: {
    from: disposableFromMock,
  },
}))

vi.mock('../../lsp/openLspDocument.ts', () => ({
  openLspDocument: openLspDocumentMock,
}))

vi.mock('../../lsp/nudgeModule.ts', () => ({
  nudgeCssModule: nudgeCssModuleMock,
}))

describe('[EXTENSION] watchCssSave', () => {
  const lspPath = {
    fsPath: '/project/generated.lsp',
  }

  const saveListener = {
    dispose: vi.fn(),
  }

  const changeListener = {
    dispose: vi.fn(),
  }

  const createWatcher = () => {
    watcher.onDidChange.mockReturnValue(changeListener)
    createFileSystemWatcherMock.mockReturnValue(watcher)
    onDidSaveTextDocumentMock.mockReturnValue(saveListener)
  }

  it('creates a watcher and opens the LSP document', () => {
    createWatcher()

    const result = watchCssSave(lspPath as never)

    expect(
      createFileSystemWatcherMock,
    ).toHaveBeenCalledWith(
      '/project/generated.lsp',
    )

    expect(openLspDocumentMock).toHaveBeenCalledWith(
      lspPath,
    )

    expect(result).toBe(
      disposableFromMock.mock.results[0].value,
    )
  })

  it('ignores saved documents that are not CSS', () => {
    createWatcher()

    watchCssSave(lspPath as never)

    const saveCallback =
      onDidSaveTextDocumentMock.mock.calls[0][0]

    const document = {
      languageId: 'javascript',
    }

    saveCallback(document)

    const changeCallback =
      watcher.onDidChange.mock.calls[0][0]

    void changeCallback()

    expect(nudgeCssModuleMock).not.toHaveBeenCalled()
  })

  it('nudges the saved CSS document when the LSP file changes', async () => {
    createWatcher()

    watchCssSave(lspPath as never)

    const saveCallback =
      onDidSaveTextDocumentMock.mock.calls[0][0]

    const document = {
      languageId: cssLanguages[0].language,
    }

    saveCallback(document)

    const changeCallback =
      watcher.onDidChange.mock.calls[0][0]

    await changeCallback()

    expect(nudgeCssModuleMock).toHaveBeenCalledWith(
      document,
    )

    expect(nudgeCssModuleMock).toHaveBeenCalledOnce()
  })

  it('does nothing when the LSP file changes without a pending CSS document', async () => {
    createWatcher()

    watchCssSave(lspPath as never)

    const changeCallback =
      watcher.onDidChange.mock.calls[0][0]

    await changeCallback()

    expect(nudgeCssModuleMock).not.toHaveBeenCalled()
  })
})