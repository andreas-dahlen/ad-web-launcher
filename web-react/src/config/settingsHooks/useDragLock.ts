import { settingsStore, type SettingsStore } from '@config/appSettings'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

export const useDragLock = () => {
  // export const useCarouselStore = (id: string) => {

  useEffect(() => {
    settingsStore.getState().get()
  }, [])

  return settingsStore(
    useShallow((s: SettingsStore) => ({
      dragLock: s.settings.dragLock ?? false,
      setDragLock: s.setDragLock
    }))
  )
}