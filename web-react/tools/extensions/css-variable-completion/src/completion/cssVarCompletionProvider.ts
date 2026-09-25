import * as vscode from 'vscode'
import type { ExtensionData } from '../variables/variableSchema.ts'

export function createCssVariableCompletionProvider(
  extensionData: ExtensionData
) {
  let currentData = extensionData

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


      const currentFileData = currentData.find(data => document.uri.fsPath === data.cssPath)

      if (!currentFileData) {
        return new vscode.CompletionList([], true)
      }


      const completions = currentFileData.variables.map(variable => {
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
    updateExtensionData(extensionData: ExtensionData) {
      currentData = extensionData
    },
  }
}