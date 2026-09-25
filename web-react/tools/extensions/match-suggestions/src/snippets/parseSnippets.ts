import { parse } from 'jsonc-parser'
import { readFileSync } from 'node:fs'
import * as vscode from 'vscode'
import { snippetsSchema } from '../schemas/snippetSchema.ts'
import type { Snippets } from '../types/snippet.types.ts'
//find snippet files... 
// type Snippet = {
//   name: string
//   prefix: string[]
//   body: string
//   description?: string
//   scope?: string
//   include?: string[]
//   exclude?: string[]
// }
export function parseSnippets(
  file: string,
  output: vscode.OutputChannel,
): Snippets | null {

  const content = readFileSync(file, 'utf8')

  const parsed = parse(content)

  const result = snippetsSchema.safeParse(parsed)

  if (result.error) {
    output.appendLine('[snippets] invalid snippet file')
    output.appendLine(result.error.message)
    return null
  }

  return result.data
}