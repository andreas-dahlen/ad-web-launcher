import { settingsStore, type SettingsStore } from '@config/appSettings'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

export const useDragEnabled = () => {
  // export const useCarouselStore = (id: string) => {

  useEffect(() => {
    settingsStore.getState().get()
  }, [])

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      dragEnabled: s.settings.isDragEnabled ?? false,
      setDragEnabled: s.setDragEnabled
    }))
  )
}