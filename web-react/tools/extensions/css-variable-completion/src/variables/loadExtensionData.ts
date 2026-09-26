import { parse } from 'jsonc-parser'
import { readFileSync } from 'node:fs'
import type * as vscode from 'vscode'
import { extensionDataSchema, type ExtensionData } from './variableSchema.ts'

export function loadExtensionData(fileUri: vscode.Uri): ExtensionData {

  try {
    const fileRaw = readFileSync(fileUri.fsPath, 'utf8')
    const jsonParsed: unknown = parse(fileRaw)

    return extensionDataSchema.parse(jsonParsed)
  } catch {
    return []
  }

}