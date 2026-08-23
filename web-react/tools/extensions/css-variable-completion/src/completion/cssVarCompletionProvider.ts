import * as vscode from 'vscode'

export class CssVariableCompletionProvider
  implements vscode.CompletionItemProvider {
  constructor(
    private variables: string[],
  ) { }

  updateVariables(variables: string[]): void {
    this.variables = variables
  }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.CompletionList {
    const line = document.lineAt(position.line).text
    const beforeCursor = line.slice(0, position.character)

    // vscode.window.showInformationMessage(
    //   `completion: "${beforeCursor}"`,
    // )
    if (!/(?:^|[;{])\s*-$/.test(beforeCursor)) {
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
      false,
    )
  }
}