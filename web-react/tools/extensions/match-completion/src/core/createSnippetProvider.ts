import * as vscode from 'vscode'

const testSnippet = {
  name: 'React Component',
  body: [
    'export default function ${1:Component}({',
    '  ${2:Props}',
    '}: ${3:type}) {',
    '  return (',
    '    <>',
    '      $0',
    '    </>',
    '  )',
    '}',
  ].join('\n'),
}

export function createSnippetProvider(
  bindings: string[],
  output: vscode.OutputChannel,
): vscode.Disposable {
  output.appendLine(
    `[matchCompletion] registering snippet test provider: ${bindings.join(', ')}`,
  )

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      _document,
      _position,
    ) {
      output.appendLine(
        '[matchCompletion] providing test snippet',
      )

      const item = new vscode.CompletionItem(
        testSnippet.name,
        vscode.CompletionItemKind.Snippet,
      )
      item.filterText = 'ö'

      item.insertText = new vscode.SnippetString(
        testSnippet.body,
      )
      return [item]
    },
  }

  const selectors = [
    { scheme: 'file', language: 'typescript' },
    { scheme: 'file', language: 'javascript' },
  ]

  const completion =
    vscode.languages.registerCompletionItemProvider(
      selectors,
      provider,
      ...bindings,
    )

  output.appendLine(
    '[matchCompletion] snippet test provider registered.',
  )

  return vscode.Disposable.from(completion)
}