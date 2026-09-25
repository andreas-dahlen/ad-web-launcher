import * as vscode from 'vscode'
import { snippetBindingsSchema, snippetPathSchema } from '../../schemas/settingsSchema.ts'
import path from 'node:path'
import { existsSync } from 'node:fs'

export function parseSnippetConfig(output: vscode.OutputChannel) {
  const settings = vscode.workspace.getConfiguration('matchSuggestions')

  const gotSnippetTriggers = settings.get<unknown>('snippetTriggers')
  const gotSnippetPath = settings.get<unknown>('snippetPath')
  const parsedSnippetPath = snippetPathSchema.safeParse(gotSnippetPath)
  const parsedSnippetBindings = snippetBindingsSchema.safeParse(gotSnippetTriggers)
  if (parsedSnippetBindings.error) {
    output.appendLine(
      `[match suggestions] snippet trigger parsing error ${parsedSnippetBindings.error}`
    )
  }
  if (parsedSnippetPath.error) {
    output.appendLine(
      `[match suggestions] snippetPath parsing error ${parsedSnippetBindings.error}`
    )
  }
  const workspace = vscode.workspace.workspaceFolders?.[0]

  if (!workspace) {
    output.appendLine('[match suggestions] workspace does not exist')
  }

  let file: string | null = null
  if (workspace && parsedSnippetPath.success) {
    file = path.join(
      workspace.uri.fsPath,
      parsedSnippetPath.data,
    )
    if (!existsSync(file)) {
      output.appendLine('[match suggestions] file does not exist')
      file = null
    }
  }

  return {
    triggers: parsedSnippetBindings.data ?? null,
    file
  }
}