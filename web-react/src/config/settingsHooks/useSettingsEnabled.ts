import { settingsStore, type SettingsStore } from '@config/appSettings'
import { useShallow } from 'zustand/shallow'

export const useSettingsEnabled = () => {

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      settingsEnabled: s.settings.isSettingsEnabled ?? false,
      setSettingsEnabled: s.setSettingsEnabled
    }))
  )
}