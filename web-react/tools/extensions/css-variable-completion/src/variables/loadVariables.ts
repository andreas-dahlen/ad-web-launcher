import { parse } from 'jsonc-parser'
import { readFileSync } from 'node:fs'
import * as vscode from 'vscode'

export function loadVariables(fileUri: vscode.Uri): string[] {
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