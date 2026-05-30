import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

// appSettings.ts

/* -------------------------------------------------
   User-modifiable reactive settings
------------------------------------------------- */

type ReactiveSettings = {
  isSettingsPanelOpen: boolean
  isLayoutEditMode: boolean
  isGridEnabled: boolean
  isSnapEnabled: boolean
  dragSnapX: number
  dragSnapY: number
}

export type SettingsStore = {
  settings: ReactiveSettings
  setSettingsPanelOpen: (value: boolean) => void
  setLayoutEditMode: (value: boolean) => void
  setGridEnabled: (value: boolean) => void
  setSnapEnabled: (value: boolean) => void
  setDragSnapX: (value: number) => void
  setDragSnapY: (value: number) => void
  get: () => unknown
}

export const settingsStore = create<SettingsStore>()(
  persist(
    immer((set, get) => ({

      settings: {
        isSettingsPanelOpen: false,
        isLayoutEditMode: false,
        //drag specifics
        isGridEnabled: false,
        isSnapEnabled: true,
        dragSnapX: 8,
        dragSnapY: 16
      },

      setSettingsPanelOpen: (value) => {
        set(s => {
          s.settings.isSettingsPanelOpen = value
        })
      },

      setLayoutEditMode: (value) => {
        set(s => {
          s.settings.isLayoutEditMode = value
        })
      },
      setGridEnabled: (value) => {
        set(s => {
          s.settings.isGridEnabled = value
        })
      },

      setSnapEnabled: (value) => {
        set(s => {
          s.settings.isSnapEnabled = value
        })
      },

      setDragSnapX: (value) => {
        set(s => {
          s.settings.dragSnapX = value
        })
      },
      setDragSnapY: (value) => {
        set(s => {
          s.settings.dragSnapY = value
        })
      },

      get: () => {
        return get().settings
      }
    })
    ),
    { name: 'settings' }
  )
)