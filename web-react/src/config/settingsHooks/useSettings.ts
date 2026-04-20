import { settingsStore, type SettingsStore } from '@config/appSettings'
import { useShallow } from 'zustand/shallow'

export const useSettingsStore = () => {

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      settingsEnabled: s.settings.isSettingsEnabled ?? false,
      dragEnabled: s.settings.isDragEnabled ?? false,
      gridEnabled: s.settings.isGridEnabled ?? false,
      defaultSnapX: s.settings.defaultSnapX ?? 8,
      defaultSnapY: s.settings.defaultSnapY ?? 8,
      setSettingsEnabled: s.setSettingsEnabled,
      setDragEnabled: s.setDragEnabled,
      setGridEnabled: s.setGridEnabled,
    }))
  )
}