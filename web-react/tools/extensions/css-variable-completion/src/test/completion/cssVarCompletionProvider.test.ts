import { describe, expect, it, vi } from 'vitest'
import * as vscode from 'vscode'

import type { ExtensionData } from '../../variables/variableSchema.ts'
import { createCssVariableCompletionProvider } from '../../completion/cssVarCompletionProvider.ts'

const CompletionItemMock = vi.hoisted(() =>
  vi.fn(function (
    this: {
      label: string
      kind: unknown
      insertText?: string
      filterText?: string
      sortText?: string
    },
    label: string,
    kind: unknown,
  ) {
    this.label = label
    this.kind = kind
  }),
)

const CompletionListMock = vi.hoisted(() =>
  vi.fn(function (
    this: {
      items: unknown[]
      isIncomplete: boolean
    },
    items: unknown[],
    isIncomplete: boolean,
  ) {
    this.items = items
    this.isIncomplete = isIncomplete
  }),
)

const completionItemKind = vi.hoisted(() => ({
  Variable: 'variable',
}))

vi.mock('vscode', () => ({
  CompletionItem: CompletionItemMock,
  CompletionItemKind: completionItemKind,
  CompletionList: CompletionListMock,
}))

const cssPath = '/styles/button.css'

type ExtensionDataItem = ExtensionData[number]

const createExtensionData = (
  variables: string[],
  path = cssPath,
): ExtensionDataItem => ({
  cssPath: path,
  variables,
})

const createProvider = (
  extensionData: ExtensionData,
) =>
  createCssVariableCompletionProvider(extensionData).provider

const provide = (
  provider: ReturnType<typeof createProvider>,
  text: string,
  character = text.length,
  filePath = cssPath,
): vscode.CompletionList => {
  const result = provider.provideCompletionItems(
    {
      lineAt: () => ({
        text,
      }),
      uri: {
        fsPath: filePath,
      },
    } as never,
    {
      line: 0,
      character,
    } as never,
    {} as never,
    {} as never,
  )

  return result as vscode.CompletionList
}

describe('[EXTENSION] CssVariableCompletionProvider', () => {
  it('returns no completions when the cursor is not after a variable trigger', () => {
    const provider = createProvider([
      createExtensionData([
        '--color-primary',
      ]),
    ])

    const result = provide(provider, 'color: -')

    expect(result.items).toEqual([])
    expect(result.isIncomplete).toBe(true)
  })

  it('provides variables after a CSS property separator', () => {
    const provider = createProvider([
      createExtensionData([
        '--color-primary',
        '--color-secondary',
      ]),
    ])

    const result = provide(provider, 'color: red; -')

    expect(result.items).toHaveLength(2)
    expect(result.isIncomplete).toBe(true)

    expect(result.items[0]).toMatchObject({
      label: '--color-primary',
      kind: completionItemKind.Variable,
      insertText: '--color-primary',
      filterText: '--color-primary',
      sortText: 'zzz---color-primary',
    })

    expect(result.items[1]).toMatchObject({
      label: '--color-secondary',
      kind: completionItemKind.Variable,
      insertText: '--color-secondary',
      filterText: '--color-secondary',
      sortText: 'zzz---color-secondary',
    })
  })

  it('provides variables after an opening brace', () => {
    const provider = createProvider([
      createExtensionData([
        '--color-primary',
      ]),
    ])

    const result = provide(provider, '.foo { -')

    expect(result.items).toHaveLength(1)

    expect(result.items[0]).toMatchObject({
      label: '--color-primary',
      insertText: '--color-primary',
      filterText: '--color-primary',
      sortText: 'zzz---color-primary',
    })
  })

  it('does not lower priority after a double dash', () => {
    const provider = createProvider([
      createExtensionData([
        '--color-primary',
      ]),
    ])

    const result = provide(provider, '.foo { --')

    expect(result.items).toHaveLength(1)

    expect(result.items[0]).toMatchObject({
      label: '--color-primary',
      insertText: '--color-primary',
      filterText: '--color-primary',
    })

    expect(result.items[0]).not.toHaveProperty('sortText')
  })

  it('only provides variables for the current file', () => {
    const provider = createProvider([
      createExtensionData([
        '--button-color',
      ], '/styles/button.css'),
      createExtensionData([
        '--label-color',
      ], '/styles/label.css'),
    ])

    const result = provide(
      provider,
      '.foo { -',
      undefined,
      '/styles/button.css',
    )

    expect(result.items).toHaveLength(1)

    expect(result.items[0]).toMatchObject({
      label: '--button-color',
      insertText: '--button-color',
      filterText: '--button-color',
    })
  })

  it('returns no completions when the current file has no extension data', () => {
    const provider = createProvider([
      createExtensionData([
        '--button-color',
      ], '/styles/button.css'),
    ])

    const result = provide(
      provider,
      '.foo { -',
      undefined,
      '/styles/unknown.css',
    )

    expect(result.items).toEqual([])
    expect(result.isIncomplete).toBe(true)
  })

  it('uses updated extension data for subsequent completions', () => {
    const completion = createCssVariableCompletionProvider([
      createExtensionData([
        '--old-variable',
      ]),
    ])

    completion.updateExtensionData([
      createExtensionData([
        '--new-variable',
      ]),
    ])

    const result = provide(completion.provider, '-')

    expect(result.items).toHaveLength(1)

    expect(result.items[0]).toMatchObject({
      label: '--new-variable',
      insertText: '--new-variable',
      filterText: '--new-variable',
      sortText: 'zzz---new-variable',
    })
  })
})