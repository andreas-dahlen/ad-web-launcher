import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

// appSettings.ts

/* -------------------------------------------------
   User-modifiable reactive settings
   ------------------------------------------------- */
type SettingsMode = "default" | "layout" // 📦 The main structural tabs
type LayoutMode = "lanes" | "scenes" | "locks" // 🎬 The active canvas tool

export type ReactiveSettings = {
  panelOpen: boolean
  settingsMode: SettingsMode

  layoutMode: LayoutMode
  layoutManagerV: boolean
  layoutManagerH: boolean

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
        panelOpen: false,
        settingsMode: "default",

        layoutMode: "scenes",
        layoutManagerV: false,
        layoutManagerH: false,
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