import { describe, expect, it, vi } from 'vitest'

import { watchVariables } from '../../variables/watchVariables.ts'
import { loadExtensionData } from '../../variables/loadExtensionData.ts'

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

vi.mock('../../variables/loadExtensionData.ts', () => ({
  loadExtensionData: vi.fn(),
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

  const createUpdateExtensionData = () => vi.fn()

  const createOutput = () => ({
    appendLine: vi.fn(),
  })

  const extensionData = [
    {
      cssPath: '/project/src/button.css',
      variables: [
        '--color-primary',
        '--color-secondary',
      ],
    },
    {
      cssPath: '/project/src/carousel.css',
      variables: [
        '--carousel-height',
      ],
    },
  ]

  const variablesUri = {
    fsPath: '/project/extension.generated.jsonc',
  }

  it('updates extension data when the file changes', () => {
    const watcher = createWatcher()

    createFileSystemWatcherMock.mockReturnValue(watcher)

    vi.mocked(loadExtensionData).mockReturnValue(
      extensionData,
    )

    const updateExtensionData = createUpdateExtensionData()
    const output = createOutput()

    watchVariables(
      variablesUri as never,
      updateExtensionData,
      output as never,
    )

    const reloadExtensionData =
      watcher.onDidChange.mock.calls[0][0]

    reloadExtensionData()

    expect(loadExtensionData).toHaveBeenCalledWith(
      variablesUri,
    )

    expect(updateExtensionData).toHaveBeenCalledWith(
      extensionData,
    )

    expect(output.appendLine).toHaveBeenCalledWith(
      '[css variable completion] updated: 2 variables',
    )
  })

  it('updates extension data when the file is created', () => {
    const watcher = createWatcher()

    createFileSystemWatcherMock.mockReturnValue(watcher)

    vi.mocked(loadExtensionData).mockReturnValue([
      {
        cssPath: '/project/src/button.css',
        variables: [
          '--color-primary',
        ],
      },
    ])

    const updateExtensionData = createUpdateExtensionData()
    const output = createOutput()

    watchVariables(
      variablesUri as never,
      updateExtensionData,
      output as never,
    )

    const reloadExtensionData =
      watcher.onDidCreate.mock.calls[0][0]

    reloadExtensionData()

    expect(updateExtensionData).toHaveBeenCalledWith([
      {
        cssPath: '/project/src/button.css',
        variables: [
          '--color-primary',
        ],
      },
    ])

    expect(output.appendLine).toHaveBeenCalledWith(
      '[css variable completion] updated: 1 variables',
    )
  })

  it('returns a disposable containing the watcher and listeners', () => {
    const watcher = createWatcher()

    createFileSystemWatcherMock.mockReturnValue(watcher)

    vi.mocked(loadExtensionData).mockReturnValue([])

    const updateExtensionData = createUpdateExtensionData()
    const output = createOutput()

    const disposable = watchVariables(
      variablesUri as never,
      updateExtensionData,
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