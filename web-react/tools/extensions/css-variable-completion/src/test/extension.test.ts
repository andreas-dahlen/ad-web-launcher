import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { activate, deactivate } from '../extension.ts'
const workspaceFolders = vi.hoisted(
  () => [] as unknown[],
)

const createOutputChannelMock = vi.hoisted(() =>
  vi.fn(),
)

const onDidChangeConfigurationMock = vi.hoisted(() =>
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

const variableEntryMock = vi.hoisted(() =>
  vi.fn(),
)

const lspEntryMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({
  window: {
    createOutputChannel:
      createOutputChannelMock,
  },

  workspace: {
    get workspaceFolders() {
      return workspaceFolders
    },

    onDidChangeConfiguration:
      onDidChangeConfigurationMock,
  },

  Disposable: {
    from: disposableFromMock,
  },
}))

vi.mock('../variables/variableEntry.ts', () => ({
  variableEntry: variableEntryMock,
}))

vi.mock('../lsp/lspEntry.ts', () => ({
  lspEntry: lspEntryMock,
}))

afterEach(() => {
  workspaceFolders.length = 0
})

describe('[EXTENSION] activate', () => {
  const output = {
    appendLine: vi.fn(),
    dispose: vi.fn(),
  }

  const workspaceFolder = {
    uri: {
      fsPath: '/project',
    },
  }

  const variableDisposable = {
    dispose: vi.fn(),
  }

  const lspDisposable = {
    dispose: vi.fn(),
  }

  const configurationListener = {
    dispose: vi.fn(),
  }

  const createOutput = () => {
    createOutputChannelMock.mockReturnValue(output)

    onDidChangeConfigurationMock.mockReturnValue(
      configurationListener,
    )
  }

  it('shuts down when there is no workspace folder', () => {
    createOutput()

    const context = {
      subscriptions: [],
    }

    activate(context as never)

    expect(createOutputChannelMock).toHaveBeenCalledWith(
      'CSS Variable Completion',
    )

    expect(output.appendLine).toHaveBeenCalledWith(
      '[css variable completion] loaded',
    )

    expect(output.appendLine).toHaveBeenCalledWith(
      '[css variable completion] no workspace folder. Shutting down.',
    )

    expect(variableEntryMock).not.toHaveBeenCalled()
    expect(lspEntryMock).not.toHaveBeenCalled()

    expect(context.subscriptions).toContain(output)
  })

  it('launches variable and LSP entries for the workspace', () => {
    createOutput()
    workspaceFolders.push(workspaceFolder)

    variableEntryMock.mockReturnValue(
      variableDisposable,
    )

    lspEntryMock.mockReturnValue(
      lspDisposable,
    )

    const context = {
      subscriptions: [],
    }

    activate(context as never)

    expect(variableEntryMock).toHaveBeenCalledWith(
      workspaceFolder,
      output,
    )

    expect(lspEntryMock).toHaveBeenCalledWith(
      workspaceFolder,
    )

    expect(disposableFromMock).toHaveBeenCalledWith(
      variableDisposable,
      lspDisposable,
    )

    expect(context.subscriptions).toContain(output)
    expect(context.subscriptions).toContain(
      configurationListener,
    )
  })

  it('ignores unrelated configuration changes', () => {
    createOutput()
    workspaceFolders.push(workspaceFolder)

    variableEntryMock.mockReturnValue(
      variableDisposable,
    )

    lspEntryMock.mockReturnValue(
      lspDisposable,
    )

    activate({
      subscriptions: [],
    } as never)

    const configurationCallback =
      onDidChangeConfigurationMock.mock.calls[0][0]

    configurationCallback({
      affectsConfiguration: vi.fn(() => false),
    })

    expect(variableEntryMock).toHaveBeenCalledOnce()
    expect(lspEntryMock).toHaveBeenCalledOnce()
    expect(variableDisposable.dispose).not.toHaveBeenCalled()
    expect(lspDisposable.dispose).not.toHaveBeenCalled()
  })

  it('relaunches when CSS variable configuration changes', () => {
    createOutput()
    workspaceFolders.push(workspaceFolder)

    variableEntryMock.mockReturnValue(
      variableDisposable,
    )

    lspEntryMock.mockReturnValue(
      lspDisposable,
    )

    activate({
      subscriptions: [],
    } as never)

    const configurationCallback =
      onDidChangeConfigurationMock.mock.calls[0][0]

    configurationCallback({
      affectsConfiguration: vi.fn(() => true),
    })

    expect(variableDisposable.dispose).toHaveBeenCalledOnce()
    expect(lspDisposable.dispose).toHaveBeenCalledOnce()

    expect(variableEntryMock).toHaveBeenCalledTimes(2)
    expect(lspEntryMock).toHaveBeenCalledTimes(2)

    expect(output.appendLine).toHaveBeenCalledWith(
      '[css variable completion] configuration changed. Relaunching.',
    )
  })
})

describe('[EXTENSION] deactivate', () => {
  it('can deactivate without errors', () => {
    expect(() => deactivate()).not.toThrow()
  })
})