import { describe, expect, it, vi } from 'vitest'

import { CssVariableCompletionProvider } from '../../completion/cssVarCompletionProvider.ts'

const CompletionItemMock = vi.hoisted(() =>
  vi.fn(function (
    this: {
      label: string
      kind: unknown
      insertText?: string
      filterText?: string
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

describe('[EXTENSION] CssVariableCompletionProvider', () => {
  it('returns no completions when the cursor is not after a variable trigger', () => {
    const provider = new CssVariableCompletionProvider([
      '--color-primary',
    ])

    const result = provider.provideCompletionItems(
      {
        lineAt: () => ({
          text: 'color: -',
        }),
      } as never,
      {
        line: 0,
        character: 9,
      } as never,
    )

    expect(result.items).toEqual([])
    expect(result.isIncomplete).toBe(false)
  })

  it('provides variables after a CSS property separator', () => {
    const provider = new CssVariableCompletionProvider([
      '--color-primary',
      '--color-secondary',
    ])

    const result = provider.provideCompletionItems(
      {
        lineAt: () => ({
          text: 'color: red; -',
        }),
      } as never,
      {
        line: 0,
        character: 13,
      } as never,
    )

    expect(result.items).toHaveLength(2)

    expect(result.items[0]).toMatchObject({
      label: '--color-primary',
      kind: completionItemKind.Variable,
      insertText: '--color-primary',
      filterText: '--color-primary',
    })

    expect(result.items[1]).toMatchObject({
      label: '--color-secondary',
      kind: completionItemKind.Variable,
      insertText: '--color-secondary',
      filterText: '--color-secondary',
    })
  })

  it('provides variables after an opening brace', () => {
    const provider = new CssVariableCompletionProvider([
      '--color-primary',
    ])

    const result = provider.provideCompletionItems(
      {
        lineAt: () => ({
          text: '.foo { -',
        }),
      } as never,
      {
        line: 0,
        character: 9,
      } as never,
    )

    expect(result.items).toHaveLength(1)

    expect(result.items[0]).toMatchObject({
      label: '--color-primary',
      insertText: '--color-primary',
      filterText: '--color-primary',
    })
  })

  it('uses updated variables for subsequent completions', () => {
    const provider = new CssVariableCompletionProvider([
      '--old-variable',
    ])

    provider.updateVariables([
      '--new-variable',
    ])

    const result = provider.provideCompletionItems(
      {
        lineAt: () => ({
          text: '-',
        }),
      } as never,
      {
        line: 0,
        character: 1,
      } as never,
    )

    expect(result.items).toHaveLength(1)

    expect(result.items[0]).toMatchObject({
      label: '--new-variable',
      insertText: '--new-variable',
      filterText: '--new-variable',
    })
  })
})