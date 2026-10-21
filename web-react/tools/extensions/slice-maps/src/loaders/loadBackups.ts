import * as vscode from 'vscode'
import type { ExclusionFileData } from '../types/vscode.types.ts'
export type LoadBackups = NonNullable<ReturnType<typeof loadBackups>>
export const loadBackups = (
  context: vscode.ExtensionContext
) => {
  return {
    getPersistedExclude(): ExclusionFileData | undefined {
      return context.workspaceState.get<ExclusionFileData>('excludeSnapshots')
    },
    async setPersistedExclude(exclude: ExclusionFileData | undefined): Promise<void> {
      await context.workspaceState.update(
        'excludeSnapshots',
        exclude
      )
    },

    getPersistedActiveState(): boolean | undefined {
      return context.workspaceState.get<boolean>('activeState')
    },
    async setPersistedActiveState(isActive: boolean): Promise<void> {
      await context.workspaceState.update(
        'activeState',
        isActive
      )
    }
  }
}