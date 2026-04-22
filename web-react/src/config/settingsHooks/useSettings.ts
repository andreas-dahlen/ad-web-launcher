import { settingsStore, type SettingsStore } from '@config/appSettings.ts'
import { useShallow } from 'zustand/shallow'

export const useSettingsStore = () => {

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      settingsOverlayEnabled: s.settings.isSettingsOverlayEnabled ?? false,
      dragEnabled: s.settings.isDragEnabled ?? false,
      gridEnabled: s.settings.isGridEnabled ?? false,
      dragSnapX: s.settings.dragSnapX ?? 8,
      dragSnapY: s.settings.dragSnapY ?? 8,
      setDragSnapX: s.setDragSnapX,
      setDragSnapY: s.setDragSnapY,
      setSettingsEnabled: s.setSettingsEnabled,
      setDragEnabled: s.setDragEnabled,
      setGridEnabled: s.setGridEnabled,
    }))
  )
}