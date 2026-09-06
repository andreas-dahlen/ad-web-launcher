import { describe, expect, it, vi } from 'vitest'

import { variableEntry } from '../../variables/variableEntry.ts'
import { resolveVariablesUri } from '../../config/paths.ts'
import { loadVariables } from '../../variables/loadVariables.ts'
import { watchVariables } from '../../variables/watchVariables.ts'
import { cssLanguages } from '../../config/languages.ts'

const registerCompletionItemProviderMock = vi.hoisted(() =>
  vi.fn(),
)

const disposableFromMock = vi.hoisted(() =>
  vi.fn((...disposables) => ({
    dispose: vi.fn(() => {
      for (const disposable of disposables) {
        disposable.dispose()
      }
    })
  }))
)

const providerConstructor = vi.hoisted(() =>
  vi.fn(
    class {
      constructor(_variables: string[]) { }
    },
  ),
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
    CssVariableCompletionProvider: providerConstructor,
  }),
)

vi.mock('../../config/languages.ts', () => ({
  cssLanguages: ['css', 'scss'],
}))

describe('[EXTENSION] variableEntry', () => {
  const workspaceFolder = {
    uri: {
      fsPath: '/project',
    },
  }

  const variablesUri = {
    fsPath: '/project/extension.generated.jsonc',
  }

  const output = {
    appendLine: vi.fn(),
  }

  it('returns null when no variables file is configured', () => {
    vi.mocked(resolveVariablesUri).mockReturnValue(undefined)

    const result = variableEntry(
      workspaceFolder as never,
      output as never,
    )

    expect(result).toBeNull()

    expect(loadVariables).not.toHaveBeenCalled()
    expect(providerConstructor).not.toHaveBeenCalled()
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

    const completion = {
      dispose: vi.fn(),
    }

    vi.mocked(resolveVariablesUri).mockReturnValue(
      variablesUri as never,
    )

    vi.mocked(loadVariables).mockReturnValue(variables)

    vi.mocked(watchVariables).mockReturnValue(
      watcher as never,
    )

    registerCompletionItemProviderMock.mockReturnValue(
      completion,
    )

    const result = variableEntry(
      workspaceFolder as never,
      output as never,
    )

    const provider =
      providerConstructor.mock.results[0].value

    expect(resolveVariablesUri).toHaveBeenCalledWith(
      workspaceFolder,
    )

    expect(loadVariables).toHaveBeenCalledWith(
      variablesUri,
    )

    expect(providerConstructor).toHaveBeenCalledWith(
      variables,
    )

    expect(watchVariables).toHaveBeenCalledWith(
      variablesUri,
      provider,
      output,
    )

    expect(
      registerCompletionItemProviderMock,
    ).toHaveBeenCalledWith(
      cssLanguages,
      provider,
      '-',
    )

    expect(disposableFromMock).toHaveBeenCalledWith(
      watcher,
      completion,
    )

    expect(result).toBe(
      disposableFromMock.mock.results[0].value,
    )
  })
})