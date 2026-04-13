import { settingsStore, type SettingsStore } from '@config/appSettings'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

export const useGridEnabled = () => {
  // export const useCarouselStore = (id: string) => {

  useEffect(() => {
    settingsStore.getState().get()
  }, [])

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      gridEnabled: s.settings.isGridEnabled ?? false,
      setGridEnabled: s.setGridEnabled
    }))
  )
}