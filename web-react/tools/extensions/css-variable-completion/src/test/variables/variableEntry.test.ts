import { describe, expect, it, vi } from 'vitest'

import { variableEntry } from '../../variables/variableEntry.ts'
import { resolveVariablesUri } from '../../config/paths.ts'
import { loadVariables } from '../../variables/loadVariables.ts'
import { watchVariables } from '../../variables/watchVariables.ts'
import { cssLanguages } from '../../config/languages.ts'
import type { Uri } from 'vscode'

const registerCompletionItemProviderMock = vi.hoisted(() =>
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

const createProviderMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({
  languages: {
    registerCompletionItemProvider:
      registerCompletionItemProviderMock,
  },
  Disposable: {
    from: disposableFromMock,
  },
}))

vi.mock('../../config/paths.ts', () => ({
  resolveVariablesUri: vi.fn(),
}))

vi.mock('../../variables/loadVariables.ts', () => ({
  loadVariables: vi.fn(),
}))

vi.mock('../../variables/watchVariables.ts', () => ({
  watchVariables: vi.fn(),
}))

vi.mock(
  '../../completion/cssVarCompletionProvider.ts',
  () => ({
    createCssVariableCompletionProvider:
      createProviderMock,
  }),
)

vi.mock('../../config/languages.ts', () => ({
  cssLanguages: ['css', 'scss'],
}))

describe('[EXTENSION] variableEntry', () => {
  const cascadeRoot = '/project'

  const variablesUri = {
    fsPath: '/project/extension.generated.jsonc',
  }

  const output = {
    appendLine: vi.fn(),
  }

  it('returns null when no variables file is configured', () => {
    vi.mocked(resolveVariablesUri).mockReturnValue(undefined as unknown as Uri)

    const result = variableEntry(
      cascadeRoot,
      output as never,
    )

    expect(result).toBeNull()

    expect(loadVariables).not.toHaveBeenCalled()
    expect(createProviderMock).not.toHaveBeenCalled()
    expect(watchVariables).not.toHaveBeenCalled()
    expect(
      registerCompletionItemProviderMock,
    ).not.toHaveBeenCalled()
  })

  it('sets up variable completion when a variables file exists', () => {
    const variables = [
      '--color-primary',
      '--color-secondary',
    ]

    const watcher = {
      dispose: vi.fn(),
    }

    const registration = {
      dispose: vi.fn(),
    }

    const completion = {
      provider: {},
      updateVariables: vi.fn(),
    }

    vi.mocked(resolveVariablesUri).mockReturnValue(
      variablesUri as never,
    )

    vi.mocked(loadVariables).mockReturnValue(variables)

    createProviderMock.mockReturnValue(completion)

    vi.mocked(watchVariables).mockReturnValue(
      watcher as never,
    )

    registerCompletionItemProviderMock.mockReturnValue(
      registration,
    )

    const result = variableEntry(
      cascadeRoot,
      output as never,
    )

    expect(resolveVariablesUri).toHaveBeenCalledWith(
      cascadeRoot,
    )

    expect(loadVariables).toHaveBeenCalledWith(
      variablesUri,
    )

    expect(createProviderMock).toHaveBeenCalledWith(
      variables,
    )

    expect(watchVariables).toHaveBeenCalledWith(
      variablesUri,
      completion.updateVariables,
      output,
    )

    expect(
      registerCompletionItemProviderMock,
    ).toHaveBeenCalledWith(
      cssLanguages,
      completion.provider,
      '-',
    )

    expect(disposableFromMock).toHaveBeenCalledWith(
      watcher,
      registration,
    )

    expect(result).toBe(
      disposableFromMock.mock.results[0].value,
    )
  })
})