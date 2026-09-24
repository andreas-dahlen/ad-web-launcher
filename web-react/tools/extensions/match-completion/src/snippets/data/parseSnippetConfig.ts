import * as vscode from 'vscode'
import { snippetBindingsSchema, snippetPathSchema } from '../../schemas/settingsSchema.ts'
import path from 'node:path'
import { existsSync } from 'node:fs'

export function parseSnippetConfig(output: vscode.OutputChannel) {
  const settings = vscode.workspace.getConfiguration('matchCompletion')

  const gotSnippetBindings = settings.get<unknown>('snippetBindings')
  const gotSnippetPath = settings.get<unknown>('snippetPath')
  const parsedSnippetPath = snippetPathSchema.safeParse(gotSnippetPath)
  const parsedSnippetBindings = snippetBindingsSchema.safeParse(gotSnippetBindings)
  if (parsedSnippetBindings.error) {
    output.appendLine(
      `[matchCompletion] binding parsing error ${parsedSnippetBindings.error}`
    )
  }
  if (parsedSnippetPath.error) {
    output.appendLine(
      `[matchCompletion] snippetPath parsing error ${parsedSnippetBindings.error}`
    )
  }
  const workspace = vscode.workspace.workspaceFolders?.[0]

  if (!workspace) {
    output.appendLine('[snippets] workspace does not exist')
  }

  let file: string | null = null
  if (workspace && parsedSnippetPath.success) {
    file = path.join(
      workspace.uri.fsPath,
      parsedSnippetPath.data,
    )
    if (!existsSync(file)) {
      output.appendLine('[snippets] file does not exist')
      file = null
    }
  }

  return {
    bindings: parsedSnippetBindings.data ?? null,
    file
  }
}

