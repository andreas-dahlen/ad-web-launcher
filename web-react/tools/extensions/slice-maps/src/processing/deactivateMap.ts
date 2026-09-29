import * as vscode from 'vscode'
import type { SliceMap } from '../types/dataStructure.types.ts'


export async function deactivateMap(
  map: SliceMap,
  exclude: Record<string, boolean>,
  config: vscode.WorkspaceConfiguration

): Promise<void> {

  for (const path of map.resolvedExclude.keys()) {
    delete exclude[path]
  }

  await config.update(
    'exclude',
    exclude,
    vscode.ConfigurationTarget.WorkspaceFolder
  )
}