import * as vscode from 'vscode'

export function createCssVariableCompletionProvider(
  variables: string[]
) {
  let currentVariables = variables

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      document,
      position
    ) {
      const line = document.lineAt(position.line).text
      const beforeCursor = line.slice(0, position.character)

      if (!/(?:^|[;{])\s*-/.test(beforeCursor)) {
        return new vscode.CompletionList([], true)
      }
      const isDoubleDash = /(?:^|[;{])\s*--/.test(beforeCursor)

      const completions = currentVariables.map(variable => {
        const item = new vscode.CompletionItem(
          variable,
          vscode.CompletionItemKind.Variable,
        )

        item.insertText = variable
        item.filterText = variable

        if (!isDoubleDash) {
          item.sortText = `zzz-${variable}`
        }

        return item
      })

      return new vscode.CompletionList(
        completions,
        true,
      )
    }
  }

  return {
    provider,
    updateVariables(variables: string[]) {
      currentVariables = variables
    },
  }
}