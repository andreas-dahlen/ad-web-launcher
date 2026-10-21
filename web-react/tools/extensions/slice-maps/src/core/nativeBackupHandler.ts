import type { AppStateCache } from '../cache/appStateCache.ts'
import type { ExclusionFileData } from '../types/vscode.types.ts'
import * as vscode from 'vscode'
import { loadBackups } from '../loaders/loadBackups.ts'

export type NativeBackupHandler = NonNullable<ReturnType<typeof createNativeBackupHandler>>
export function createNativeBackupHandler(
  appGet: AppStateCache["appGet"],
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder
) {

  let local: Record<string, boolean>

  let total: Record<string, boolean>

  const backup = loadBackups(context)

  async function syncActiveState(): Promise<void> {
    await backup.setPersistedActiveState(appGet.hasActiveSlice())
  }

  return {
    syncActiveState,

    getLocalExclude(): Record<string, boolean> {
      return local
    },
    getTotalExclude(): Record<string, boolean> {
      return total
    },

    getPersistedExclude(): ExclusionFileData {
      const data = backup.getPersistedExclude()
      if (data) return data
      if (appGet.hasActiveSlice()) {
        throw new Error("[ERROR] persisted was undefined and unable to get backup value in an active state")
      }
      return getFileExcludes(root)
    },

    getPersistedActiveState(): boolean {
      const data = backup.getPersistedActiveState()
      return data ?? false
    },


    async syncExclude(): Promise<void> {
      if (appGet.hasActiveSlice()) return
      const data = getFileExcludes(root)
      await backup.setPersistedExclude(data)
      local = data.local
      total = data.total
      await syncActiveState()
    }
  }
}



function getFileExcludes(root: vscode.WorkspaceFolder): ExclusionFileData {
  const config = vscode.workspace.getConfiguration('files', root.uri)
  const localExclude = config.inspect<Record<string, boolean>>('exclude')
  const totalExclude = config.get<Record<string, boolean>>('exclude', {})
  return {
    local: localExclude?.workspaceFolderValue ?? {},
    total: totalExclude
  }
}