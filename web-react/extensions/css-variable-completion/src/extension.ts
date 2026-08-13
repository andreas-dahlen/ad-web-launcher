import * as vscode from 'vscode'
import { parse } from 'jsonc-parser'
import { readFileSync } from 'node:fs'

function loadVariables(fileUri: vscode.Uri): string[] {
  const contents = readFileSync(fileUri.fsPath, 'utf8')

  const parsed: unknown = parse(contents)

  if (!Array.isArray(parsed)) {
    throw new Error(
      'cssVariables.generated.jsonc must contain an array',
    )
  }

  if (!parsed.every((value): value is string => typeof value === 'string')) {
    throw new Error(
      'cssVariables.generated.jsonc must contain only strings',
    )
  }

  return parsed
}

class CssVariableCompletionProvider
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
      false,
    )
  }
}

async function openLspDocument(lspPath: vscode.Uri): Promise<void> {
  try {
    await vscode.workspace.openTextDocument(lspPath);
  } catch (error) {
    console.error(
      `[css variable completion] failed to open LSP document: ${String(error)}`,
    );
  }
}
export function activate(context: vscode.ExtensionContext): void {
  // vscode.window.showInformationMessage(
  //   '[css variable completion loaded]',
  // )

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]


  if (!workspaceFolder) {
    vscode.window.showErrorMessage(
      '[css variable completion] no workspace folder',
    )
    return
  }
  const lspPath = vscode.Uri.joinPath(
    workspaceFolder?.uri,
    "web-react/src/shared/generated/metadata/cssVariables.generated.ts",
  )

  void openLspDocument(lspPath)

  const config = vscode.workspace.getConfiguration(
    'cssVariableCompletion',
  )

  const variablesFile = config.get<string>('variablesFile')

  if (!variablesFile) {
    vscode.window.showErrorMessage(
      '[css variable completion] variablesFile setting is missing',
    )
    return
  }

  const variablesUri = vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...variablesFile.split('/'),
  )

  // vscode.window.showInformationMessage(
  //   `[css variable completion] loading ${variablesUri.fsPath}`,
  // )

  let variables: string[]

  try {
    variables = loadVariables(variablesUri)
  } catch (error) {
    vscode.window.showErrorMessage(
      `[css variable completion] failed to load variables: ${String(error)}`,
    )
    return
  }

  vscode.window.showInformationMessage(
    `[css variable completion] loaded ${variables.length} variables`,
  )

  const provider = new CssVariableCompletionProvider(variables)

  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      workspaceFolder,
      variablesFile,
    ),
  )

  context.subscriptions.push(
    watcher,

    watcher.onDidChange(() => {
      try {
        provider.updateVariables(loadVariables(variablesUri))
      } catch (error) {
        vscode.window.showErrorMessage(
          `[css variable completion] failed to reload variables: ${String(error)}`,
        )
      }
    }),

    watcher.onDidCreate(() => {
      try {
        provider.updateVariables(loadVariables(variablesUri))
      } catch (error) {
        vscode.window.showErrorMessage(
          `[css variable completion] failed to load variables: ${String(error)}`,
        )
      }
    }),
  )

  const selector = [
    { language: 'css' },
    { language: 'scss' },
    { language: 'less' },
  ]

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      provider,
      '-',
    ),
  )

  // vscode.window.showInformationMessage(
  //   '[css variable completion] provider registered',
  // )
}

export function deactivate(): void { }
