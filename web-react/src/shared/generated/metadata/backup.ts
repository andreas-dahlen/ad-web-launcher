import * as vscode from 'vscode'
import { parse } from 'jsonc-parser'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function loadVariables(extensionUri: vscode.Uri): string[] {
  const filePath = join(extensionUri.fsPath, 'variables.jsonc')
  const contents = readFileSync(filePath, 'utf8')

  const parsed: unknown = parse(contents)

  if (!Array.isArray(parsed)) {
    throw new Error('variables.jsonc must contain an array')
  }

  if (!parsed.every((value): value is string => typeof value === 'string')) {
    throw new Error('variables.jsonc must contain only strings')
  }

  return parsed
}

class CssVariableCompletionProvider
  implements vscode.CompletionItemProvider {
  constructor(
    private readonly variables: string[],
  ) { }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.CompletionList {
    const line = document.lineAt(position.line).text
    const beforeCursor = line.slice(0, position.character)

    // vscode.window.showInformationMessage(
    //   `completion: "${beforeCursor}"`
    // )

    if (/\bvar\([^)]*$/.test(beforeCursor)) {
      return new vscode.CompletionList([], false)
    }

    return new vscode.CompletionList(
      this.variables.map((variable) => {
        const item = new vscode.CompletionItem(
          variable,
          vscode.CompletionItemKind.Variable,
        )


        item.insertText = variable
        item.filterText = variable

        return item
      }),
      false
    )
  }
}

export function activate(context: vscode.ExtensionContext): void {

  const variables = loadVariables(context.extensionUri)

  vscode.window.showInformationMessage(
    `CSS completion loaded ${variables.length} variables`
  )

  const provider = new CssVariableCompletionProvider(variables)

  const selector = [
    { language: 'css' },
    { language: 'scss' },
    { language: 'less' },
  ]

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      provider,
      "-"
    )
  )
}

export function deactivate(): void { }