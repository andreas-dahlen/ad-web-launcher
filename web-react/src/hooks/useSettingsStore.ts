import { settingsStore, type SettingsStore } from '../stores/settingsStore'
import { useShallow } from 'zustand/shallow'

export const useSettingsStore = () => {

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      isSettingsPanelOpen: s.settings.isSettingsPanelOpen ?? false,
      isLayoutEditMode: s.settings.isLayoutEditMode ?? false,
      isGridEnabled: s.settings.isGridEnabled ?? false,
      isSnapEnabled: s.settings.isSnapEnabled ?? false,
      dragSnapX: s.settings.dragSnapX ?? 8,
      dragSnapY: s.settings.dragSnapY ?? 16,
      setDragSnapX: s.setDragSnapX,
      setDragSnapY: s.setDragSnapY,
      setSettingsPanelOpen: s.setSettingsPanelOpen,
      setLayoutEditMode: s.setLayoutEditMode,
      setGridEnabled: s.setGridEnabled,
      setSnapEnabled: s.setSnapEnabled
    }))
  )
}