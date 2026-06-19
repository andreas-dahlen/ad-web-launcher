import { settingsStore, type SettingsStore } from '../stores/settings.store'
import { useShallow } from 'zustand/shallow'

export const useSettingsStore = () => {

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      settings: s.settings,
      update: s.update
    }))
  )
}