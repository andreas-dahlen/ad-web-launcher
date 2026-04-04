// appSettings.ts
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
  hysteresis: 5  // gitter removal for gating to remove gitters
}

/* -------------------------------------------------
   User-modifiable reactive settings
------------------------------------------------- */
export interface UserSettings {
  dragLock: boolean
  DragGridVisual: boolean
  defaultSnapX: number
  defaultSnapY: number
}

export const USER_SETTINGS = ({
  // = reactive<UserSettings>({
  dragLock: false,
  DragGridVisual: false,
  defaultSnapX: 8,
  defaultSnapY: 16
})