import * as vscode from 'vscode'
import { createDebug } from '../utils/debug.ts'
import { hasBasePath } from '../utils/comparePaths.ts'
import type { NodeState } from '../types/dataStructure.types.ts'


export function compress(
  resolutionData: Map<string, NodeState>,
  output: vscode.OutputChannel
): Record<string, true> {

  const filtered = filter(resolutionData, output)

  return reduse(filtered)
}

function filter(
  data: Map<string, NodeState>,
  output: vscode.OutputChannel
): Set<string> {
  const exclude = new Set<string>()
  const debug = createDebug(output, 'compression')


  for (const [path, type] of data) {
    if (type === 'include') {
      debug('[INCLUDE]', { path })
      continue
    }

    exclude.add(path)
    debug('[EXCLUDE]', { path })
  }

  debug('[RESULT]', exclude)

  return exclude
}

function reduse(filtered: Set<string>): Record<string, true> {

  const exclude: Record<string, true> = {}

  for (const path of filtered) {
    if (hasBasePath(filtered, path)) {
      continue
    }
    exclude[path] = true
  }

  return exclude
}