import { settingsStore, type SettingsStore } from '@config/appSettings'
import { useShallow } from 'zustand/shallow'

export const useDragEnabled = () => {

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      dragEnabled: s.settings.isDragEnabled ?? false,
      setDragEnabled: s.setDragEnabled
    }))
  )
}