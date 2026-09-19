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

const getMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({
  workspace: {
    get workspaceFolders() {
      return workspaceFolders.length > 0
        ? workspaceFolders
        : undefined
    },

    getConfiguration: vi.fn(() => ({
      get: getMock,
    })),
  },
}))

import { getConfig } from '../../../src/config/getConfig.ts'

describe('[CSS Variable Completion] getConfig', () => {
  const appendLine = vi.fn()

  const output = {
    appendLine,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    workspaceFolders.length = 0
    workspaceFolders.push({
      uri: {
        fsPath: '/workspace',
      },
    })

    getMock.mockReturnValue('node_modules')
  })

  it('returns undefined when the workspace folder is missing', () => {
    workspaceFolders.length = 0

    expect(getConfig(output as never)).toBeUndefined()

    expect(appendLine).toHaveBeenCalledWith(
      '[css variable completion] no workspace folder.',
    )

    expect(getMock).not.toHaveBeenCalled()
  })

  it('returns undefined when nodeModulesRoot is missing', () => {
    getMock.mockReturnValue(undefined)

    expect(getConfig(output as never)).toBeUndefined()

    expect(appendLine).toHaveBeenCalledWith(
      '[css variable completion] nodeModulesRoot is missing.',
    )
  })

  it('resolves nodeModulesRoot relative to the workspace', () => {
    expect(
      getConfig(output as never),
    ).toBe('/workspace/node_modules')
  })
})