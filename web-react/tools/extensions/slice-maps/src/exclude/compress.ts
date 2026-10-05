import * as vscode from 'vscode'
import { createDebug } from '../utils/debug.ts'

export function compress(
  resolution: Map<string, boolean>,
  output: vscode.OutputChannel
): Record<string, true> {
  const exclude: Record<string, true> = {}

  const debug = createDebug(output, 'compression')

  for (const [path, isExcluded] of resolution) {
    if (!isExcluded) {
      debug('[INCLUDE]', { path })
      continue
    }

    exclude[path] = true
    debug('[EXCLUDE]', { path })
  }

  debug('[RESULT]', exclude)

  return exclude
}