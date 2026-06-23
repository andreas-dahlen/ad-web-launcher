import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

// appSettings.ts

/* -------------------------------------------------
   User-modifiable reactive settings
------------------------------------------------- */

type ReactiveSettings = {
  //ui
  layoutManagerV: boolean
  layoutManagerH: boolean
  panelOpen: boolean
  //editing
  dragEnabled: boolean
  gridVisible: boolean
  snapEnabled: boolean

  dragSnapX: number
  dragSnapY: number
}

export type SettingsStore = {
  settings: ReactiveSettings
  update: <K extends keyof ReactiveSettings>(key: K, value: ReactiveSettings[K]) => void
}

export const settingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({

      settings: {
        layoutManagerV: false,
        layoutManagerH: false,
        panelOpen: false,
        //drag specifics
        dragEnabled: false,
        gridVisible: false,
        snapEnabled: true,
        dragSnapX: 8,
        dragSnapY: 16
      },

      update: (key, value) => {
        set((s) => {
          s.settings[key] = value
        })
      },


    })),
    { name: 'settings' }
  )
)