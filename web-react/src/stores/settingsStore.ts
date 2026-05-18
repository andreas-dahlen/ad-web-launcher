import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

// appSettings.ts

/* -------------------------------------------------
   User-modifiable reactive settings
------------------------------------------------- */

type ReactiveSettings = {
  isSettingsOverlayEnabled: boolean
  isDragEnabled: boolean
  isGridEnabled: boolean
  isSnapEnabled: boolean
  dragSnapX: number
  dragSnapY: number
}

export type SettingsStore = {
  settings: ReactiveSettings
  setDragSnapX: (value: number) => void
  setDragSnapY: (value: number) => void
  setSettingsEnabled: (value: boolean) => void
  setDragEnabled: (value: boolean) => void
  setGridEnabled: (value: boolean) => void
  setSnapEnabled: (value: boolean) => void
  get: () => unknown
}

export const settingsStore = create<SettingsStore>()(
  persist(
    immer((set, get) => ({

      settings: {
        isSettingsOverlayEnabled: false,

        //drag
        isDragEnabled: false,
        isGridEnabled: false,
        isSnapEnabled: true,
        dragSnapX: 8,
        dragSnapY: 16
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

      setSettingsEnabled: (value) => {
        set(s => {
          s.settings.isSettingsOverlayEnabled = value
        })
      },

      setDragEnabled: (value) => {
        set(s => {
          s.settings.isDragEnabled = value
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

      get: () => {
        return get().settings
      }
    })
    ),
    { name: 'settings' }
  )
)