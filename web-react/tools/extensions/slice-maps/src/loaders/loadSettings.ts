import * as vscode from 'vscode'
import type { OverrideBehavior } from '../types/vscode.types.ts'
export function getBehavior(): OverrideBehavior {
  return vscode.workspace
    .getConfiguration('sliceMaps')
    .get<OverrideBehavior>('behavior', 'recursive')
}

export function getExcludeConfigTarget(root: vscode.WorkspaceFolder) {
  return vscode.workspace.getConfiguration('files', root.uri)
}