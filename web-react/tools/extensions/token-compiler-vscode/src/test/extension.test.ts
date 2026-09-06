import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const createOutputChannelMock = vi.hoisted(() =>
  vi.fn(),
)

const createStatusBarItemMock = vi.hoisted(() =>
  vi.fn(),
)

const onDidCloseTerminalMock = vi.hoisted(() =>
  vi.fn(),
)

const onDidChangeConfigurationMock =
  vi.hoisted(() => vi.fn())

const getConfigurationMock = vi.hoisted(() =>
  vi.fn(),
)

const createCommandSubscriptionsMock =
  vi.hoisted(() => vi.fn())

const createSettingsResolverMock =
  vi.hoisted(() => vi.fn())

const createTerminalMock = vi.hoisted(() =>
  vi.fn(),
)

const updateStatusBarMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({
  StatusBarAlignment: {
    Left: 'left',
  },

  window: {
    createOutputChannel:
      createOutputChannelMock,
    createStatusBarItem:
      createStatusBarItemMock,
    onDidCloseTerminal:
      onDidCloseTerminalMock,
  },

  workspace: {
    getConfiguration:
      getConfigurationMock,
    onDidChangeConfiguration:
      onDidChangeConfigurationMock,
  },
}))

vi.mock('../config/resolveSettings.ts', () => ({
  createSettingsResolver:
    createSettingsResolverMock,
}))

vi.mock('../terminal/createTerminal.ts', () => ({
  createTerminal: createTerminalMock,
}))

vi.mock('../vscode/statusBar.ts', () => ({
  updateStatusBar: updateStatusBarMock,
}))

vi.mock('../vscode/subscriptions.ts', () => ({
  createCommandSubscriptions:
    createCommandSubscriptionsMock,
}))

import { activate } from '../extension.ts'

describe('[Token Compiler] activate', () => {
  const appendLine = vi.fn()
  const showStatusBar = vi.fn()

  const output = {
    appendLine,
    dispose: vi.fn(),
  }

  const statusBar = {
    show: showStatusBar,
  }

  const terminal = {
    show: vi.fn(),
    dispose: vi.fn(),
  }

  const commandSubscriptions = [
    { dispose: vi.fn() },
    { dispose: vi.fn() },
    { dispose: vi.fn() },
  ]

  const context = {
    subscriptions: [] as unknown[],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    context.subscriptions.length = 0

    createOutputChannelMock.mockReturnValue(output)
    createStatusBarItemMock.mockReturnValue(
      statusBar,
    )

    createCommandSubscriptionsMock.mockReturnValue(
      commandSubscriptions,
    )

    onDidCloseTerminalMock.mockImplementation(
      callback => ({ callback }),
    )

    onDidChangeConfigurationMock.mockImplementation(
      callback => ({ callback }),
    )

    getConfigurationMock.mockReturnValue(
      'settings',
    )

    createSettingsResolverMock.mockReturnValue({
      getCliSpawnPath: vi.fn(() => '/workspace/cli.js'),
      getProjectRootArg: vi.fn(() => '../..'),
      getUserOptions: vi.fn(() => 'tokens'),
    })

    createTerminalMock.mockReturnValue(terminal)
  })

  it('starts the compiler when activated', () => {
    activate(context as never)

    expect(appendLine).toHaveBeenCalledWith(
      'Extension loading...',
    )

    expect(appendLine).toHaveBeenCalledWith(
      'Starting compiler service',
    )

    expect(createSettingsResolverMock)
      .toHaveBeenCalledWith(
        'settings',
        output,
      )

    expect(createTerminalMock).toHaveBeenCalledWith(
      '/workspace/cli.js',
      '../..',
      'tokens',
    )

    expect(updateStatusBarMock).toHaveBeenCalledWith(
      statusBar,
      terminal,
    )

    expect(terminal.show).toHaveBeenCalledOnce()
    expect(showStatusBar).toHaveBeenCalledOnce()
  })

  it('shows the existing terminal when already running', () => {
    activate(context as never)

    const startCompiler =
      createCommandSubscriptionsMock.mock.calls[0][0]
        .startCompiler

    startCompiler()

    expect(terminal.show).toHaveBeenCalledTimes(2)
    expect(createTerminalMock).toHaveBeenCalledOnce()
  })

  it('stops and disposes the compiler terminal', () => {
    activate(context as never)

    const stopCompiler =
      createCommandSubscriptionsMock.mock.calls[0][0]
        .stopCompiler

    stopCompiler()

    expect(terminal.dispose).toHaveBeenCalledOnce()
    expect(updateStatusBarMock).toHaveBeenLastCalledWith(
      statusBar,
      undefined,
    )
  })

  it('restarts the compiler', () => {
    activate(context as never)

    const commands =
      createCommandSubscriptionsMock.mock
        .calls[0][0]

    commands.restartCompiler()

    expect(terminal.dispose).toHaveBeenCalledOnce()
    expect(createTerminalMock).toHaveBeenCalledTimes(2)
  })

  it('restarts when configuration changes', () => {
    activate(context as never)

    const callback =
      onDidChangeConfigurationMock.mock.calls[0][0]

    callback({
      affectsConfiguration: vi.fn(() => true),
    })

    expect(terminal.dispose).toHaveBeenCalledOnce()
    expect(createTerminalMock).toHaveBeenCalledTimes(2)
  })

  it('ignores unrelated configuration changes', () => {
    activate(context as never)

    const callback =
      onDidChangeConfigurationMock.mock.calls[0][0]

    callback({
      affectsConfiguration: vi.fn(() => false),
    })

    expect(terminal.dispose).not.toHaveBeenCalled()
    expect(createTerminalMock).toHaveBeenCalledOnce()
  })

  it('clears the compiler when its terminal closes', () => {
    activate(context as never)

    const callback =
      onDidCloseTerminalMock.mock.calls[0][0]

    callback(terminal)

    expect(updateStatusBarMock).toHaveBeenLastCalledWith(
      statusBar,
      undefined,
    )
  })

  it('ignores unrelated terminal closures', () => {
    activate(context as never)

    const callback =
      onDidCloseTerminalMock.mock.calls[0][0]

    callback({
      show: vi.fn(),
      dispose: vi.fn(),
    })

    expect(updateStatusBarMock).toHaveBeenCalledWith(
      statusBar,
      terminal,
    )
  })

  it('stops the compiler when disposed', () => {
    activate(context as never)

    const disposable =
      context.subscriptions.at(
        -1
      ) as { dispose(): void }

    disposable.dispose()

    expect(terminal.dispose).toHaveBeenCalledOnce()
  })
})