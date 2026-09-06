import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const handleLaunchMock = vi.hoisted(() =>
  vi.fn(),
)

const createOutputChannelMock = vi.hoisted(() =>
  vi.fn(),
)

const createDiagnosticCollectionMock =
  vi.hoisted(() => vi.fn())

const onDidChangeConfigurationMock =
  vi.hoisted(() => vi.fn())

const onDidSaveTextDocumentMock =
  vi.hoisted(() => vi.fn())

vi.mock('../helpers/handleLaunch.ts', () => ({
  handleLaunch: handleLaunchMock,
}))

vi.mock('vscode', () => ({
  window: {
    createOutputChannel: createOutputChannelMock,
  },

  languages: {
    createDiagnosticCollection:
      createDiagnosticCollectionMock,
  },

  workspace: {
    onDidChangeConfiguration:
      onDidChangeConfigurationMock,
    onDidSaveTextDocument:
      onDidSaveTextDocumentMock,
  },
}))

import { activate } from '../extension.ts'

describe('[Lint on Start] activate', () => {
  const appendLine = vi.fn()
  const clear = vi.fn()
  const deleteMock = vi.fn()

  const output = {
    appendLine,
  }

  const diagnostics = {
    clear,
    delete: deleteMock,
  }

  const configurationSubscription = {}
  const saveSubscription = {}

  const context = {
    subscriptions: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    context.subscriptions.length = 0

    createOutputChannelMock.mockReturnValue(output)
    createDiagnosticCollectionMock.mockReturnValue(
      diagnostics,
    )

    onDidChangeConfigurationMock.mockImplementation(
      callback => {
        return {
          callback,
        }
      },
    )

    onDidSaveTextDocumentMock.mockImplementation(
      callback => {
        return {
          callback,
        }
      },
    )

    void configurationSubscription
    void saveSubscription
  })

  it('initializes and launches linting', () => {
    activate(context as never)

    expect(
      createOutputChannelMock,
    ).toHaveBeenCalledWith('Lint on Start')

    expect(
      createDiagnosticCollectionMock,
    ).toHaveBeenCalledWith('lint-on-start')

    expect(appendLine).toHaveBeenCalledWith(
      '[Lint on Start] loaded',
    )

    expect(clear).toHaveBeenCalledOnce()

    expect(handleLaunchMock).toHaveBeenCalledWith(
      output,
      diagnostics,
    )
  })

  it('relaunches when lintOnStart configuration changes', () => {
    activate(context as never)

    const callback =
      onDidChangeConfigurationMock.mock.calls[0][0]

    callback({
      affectsConfiguration: vi.fn(() => true),
    })

    expect(clear).toHaveBeenCalledTimes(2)
    expect(handleLaunchMock).toHaveBeenCalledTimes(2)

    expect(appendLine).toHaveBeenCalledWith(
      '[Lint on Start] configuration changed. Relaunching.',
    )
  })

  it('ignores unrelated configuration changes', () => {
    activate(context as never)

    const callback =
      onDidChangeConfigurationMock.mock.calls[0][0]

    callback({
      affectsConfiguration: vi.fn(() => false),
    })

    expect(clear).toHaveBeenCalledOnce()
    expect(handleLaunchMock).toHaveBeenCalledOnce()
  })

  it('clears diagnostics when a document is saved', () => {
    activate(context as never)

    const callback =
      onDidSaveTextDocumentMock.mock.calls[0][0]

    const uri = {
      fsPath: '/workspace/src/example.ts',
    }

    callback({ uri })

    expect(deleteMock).toHaveBeenCalledWith(uri)
  })

  it('registers its subscriptions', () => {
    activate(context as never)

    expect(context.subscriptions).toHaveLength(4)

    expect(context.subscriptions).toContain(output)
    expect(context.subscriptions).toContain(
      diagnostics,
    )
  })
})