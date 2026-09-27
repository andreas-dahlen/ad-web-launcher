import * as vscode from 'vscode'
import { loadTree } from './loadTree.ts'
import type { LoadedConfig, SliceMap } from '../types/dataStructure.types.ts'


export function loadHandler(context: vscode.ExtensionContext): LoadedConfig | null {
  const root = vscode.workspace.workspaceFolders?.[0]

  if (!root) {
    return null
  }

  const config = vscode.workspace.getConfiguration(
    'files',
    root.uri,
  )

  const inspect = config.inspect<Record<string, boolean>>('exclude')

  const folderExclude = inspect?.workspaceFolderValue ?? {}



  return {
    tree: loadTree(root.uri.fsPath),
    folderExclude,
    sliceMaps: loadSliceMaps(context),
  }
}


function loadSliceMaps(
  context: vscode.ExtensionContext,
): SliceMap[] {
  return context.workspaceState.get<SliceMap[]>('sliceMaps') ?? []
}