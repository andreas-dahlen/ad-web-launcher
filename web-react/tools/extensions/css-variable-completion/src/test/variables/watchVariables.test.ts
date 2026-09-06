import { describe, expect, it, vi } from 'vitest'

import { watchVariables } from '../../variables/watchVariables.ts'
import { loadVariables } from '../../variables/loadVariables.ts'

const createFileSystemWatcherMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({
  workspace: {
    createFileSystemWatcher: createFileSystemWatcherMock,
  },
  Disposable: {
    from: vi.fn((...disposables) => ({
      dispose: vi.fn(() => {
        for (const disposable of disposables) {
          disposable.dispose()
        }
      }),
    })),
  },
}))

vi.mock('../../variables/loadVariables.ts', () => ({
  loadVariables: vi.fn(),
}))

describe('[EXTENSION] watchVariables', () => {
  const createWatcher = () => ({
    dispose: vi.fn(),
    onDidChange: vi.fn(callback => ({
      dispose: vi.fn(),
      callback,
    })),
    onDidCreate: vi.fn(callback => ({
      dispose: vi.fn(),
      callback,
    })),
  })

  const createProvider = () => ({
    updateVariables: vi.fn(),
  })

  const createOutput = () => ({
    appendLine: vi.fn(),
  })

  const variablesUri = {
    fsPath: '/project/extension.generated.jsonc',
  }

  it('updates variables when the file changes', () => {
    const watcher = createWatcher()

    createFileSystemWatcherMock.mockReturnValue(watcher)
    vi.mocked(loadVariables).mockReturnValue([
      '--color-primary',
      '--color-secondary',
    ])

    const provider = createProvider()
    const output = createOutput()

    watchVariables(
      variablesUri as never,
      provider as never,
      output as never,
    )

    const reloadVariables =
      watcher.onDidChange.mock.calls[0][0]

    reloadVariables()

    expect(loadVariables).toHaveBeenCalledWith(variablesUri)
    expect(provider.updateVariables).toHaveBeenCalledWith([
      '--color-primary',
      '--color-secondary',
    ])
  })

  it('updates variables when the file is created', () => {
    const watcher = createWatcher()

    createFileSystemWatcherMock.mockReturnValue(watcher)
    vi.mocked(loadVariables).mockReturnValue([
      '--color-primary',
    ])

    const provider = createProvider()
    const output = createOutput()

    watchVariables(
      variablesUri as never,
      provider as never,
      output as never,
    )

    const reloadVariables =
      watcher.onDidCreate.mock.calls[0][0]

    reloadVariables()

    expect(provider.updateVariables).toHaveBeenCalledWith([
      '--color-primary',
    ])
  })

  it('logs an error when variables cannot be loaded', () => {
    const watcher = createWatcher()

    createFileSystemWatcherMock.mockReturnValue(watcher)

    vi.mocked(loadVariables).mockImplementation(() => {
      throw new Error('invalid variables')
    })

    const provider = createProvider()
    const output = createOutput()

    watchVariables(
      variablesUri as never,
      provider as never,
      output as never,
    )

    const reloadVariables =
      watcher.onDidChange.mock.calls[0][0]

    reloadVariables()

    expect(provider.updateVariables).not.toHaveBeenCalled()

    expect(output.appendLine).toHaveBeenCalledWith(
      '[css variable completion] failed to load variables: Error: invalid variables',
    )
  })

  it('returns a disposable containing the watcher and listeners', () => {
    const watcher = createWatcher()

    createFileSystemWatcherMock.mockReturnValue(watcher)
    vi.mocked(loadVariables).mockReturnValue([])

    const provider = createProvider()
    const output = createOutput()

    const disposable = watchVariables(
      variablesUri as never,
      provider as never,
      output as never,
    )

    expect(createFileSystemWatcherMock).toHaveBeenCalledWith(
      variablesUri.fsPath,
    )

    expect(watcher.onDidChange).toHaveBeenCalledOnce()
    expect(watcher.onDidCreate).toHaveBeenCalledOnce()

    disposable.dispose()

    expect(watcher.dispose).toHaveBeenCalledOnce()
  })
})