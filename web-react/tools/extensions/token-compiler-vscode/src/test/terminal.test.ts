import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const spawnMock = vi.hoisted(() =>
  vi.fn(),
)

const EventEmitterMock = vi.hoisted(() =>
  vi.fn(
    class {
      event = vi.fn()
      fire = vi.fn()
    },
  ),
)

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}))

vi.mock('vscode', () => ({
  EventEmitter: EventEmitterMock,
}))

import { CompilerTerminal } from '../terminal/terminal.ts'

describe('[Token Compiler] CompilerTerminal', () => {
  const stdout = {
    on: vi.fn(),
  }

  const stderr = {
    on: vi.fn(),
  }

  const compiler = {
    stdout,
    stderr,
    on: vi.fn(),
    kill: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    spawnMock.mockReturnValue(compiler)
  })

  it('starts the compiler with the configured token folder', () => {
    const terminal = new CompilerTerminal(
      '/workspace/cli.js',
      '../..',
      'src/styleTokens/tokens',
    )

    terminal.open()

    expect(spawnMock).toHaveBeenCalledWith(
      process.execPath,
      [
        '/workspace/cli.js',
        'exe',
        '../..',
        'src/styleTokens/tokens',
      ],
    )
  })

  it('starts the compiler without a token folder', () => {
    const terminal = new CompilerTerminal(
      '/workspace/cli.js',
      '../..',
      undefined,
    )

    terminal.open()

    expect(spawnMock).toHaveBeenCalledWith(
      process.execPath,
      [
        '/workspace/cli.js',
        'exe',
        '../..',
      ],
    )
  })

  it('forwards compiler output and exit status', () => {
    const terminal = new CompilerTerminal(
      '/workspace/cli.js',
      '../..',
      undefined,
    )

    terminal.open()

    const emitter =
      EventEmitterMock.mock.instances[0]

    const write = (
      emitter as unknown as {
        fire: ReturnType<typeof vi.fn>
      }
    ).fire

    const stdoutHandler =
      stdout.on.mock.calls[0][1]

    stdoutHandler(
      Buffer.from('hello\nworld\n'),
    )

    const stderrHandler =
      stderr.on.mock.calls[0][1]

    stderrHandler(
      Buffer.from('warning\n'),
    )

    const exitHandler =
      compiler.on.mock.calls.find(
        ([event]) => event === 'exit',
      )?.[1]

    exitHandler(1)

    expect(write).toHaveBeenCalledWith(
      'Starting Token Compiler...\r\n',
    )

    expect(write).toHaveBeenCalledWith(
      'hello\r\nworld\r\n',
    )

    expect(write).toHaveBeenCalledWith(
      'warning\r\n',
    )

    expect(write).toHaveBeenCalledWith(
      '\r\nCompiler exited with code 1\r\n',
    )
  })

  it('kills the compiler when closed', () => {
    const terminal = new CompilerTerminal(
      '/workspace/cli.js',
      '../..',
      undefined,
    )

    terminal.open()
    terminal.close()

    expect(compiler.kill).toHaveBeenCalledOnce()
  })
})