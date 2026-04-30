import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

// appSettings.ts

/* -------------------------------------------------
   User-modifiable reactive settings
------------------------------------------------- */

type ReactiveSettings = {
  // loading: boolean
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
  // setLoading: (value: boolean) => void
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

      // setLoading: (value) => {
      //   set(s => {
      //     s.settings.loading = value
      //   })
      // },

      get: () => {
        return get().settings
      }
    })
    ),
    { name: 'settings' }
  )
)
/* -------------------------------------------------
   App-level constants
------------------------------------------------- */
export interface RawPhoneValues {
  width: number
  height: number
  density: number
}

export interface AppSettings {
  debugPanel: boolean
  debugWrapper: boolean
  rawPhoneValues: RawPhoneValues
  swipeAnimationMs: number
  swipeThresholdRatio: number
  swipeCommitRatio: number
  hysteresis: number
  buttonLock: boolean
}

export const APP_SETTINGS: AppSettings = {
  debugPanel: import.meta.env.VITE_DEBUG === 'true',
  debugWrapper: import.meta.env.VITE_DEBUG === 'true',

  rawPhoneValues: {
    width: 1272,
    height: 2800,
    density: 3.5
  },

  swipeAnimationMs: 250,

  swipeThresholdRatio: 0.05, // start of swipe distance
  swipeCommitRatio: 0.2,      // commitment distance on release
  hysteresis: 5,  //pixel threshold that gates out cross-axis drift during swipes.
  buttonLock: false
}