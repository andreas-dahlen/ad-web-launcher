/* -------------------------------------------------
   App-level constants
------------------------------------------------- */
interface RawPhoneValues {
  width: number
  height: number
  density: number
}

interface AppConfig {
  debugMode: boolean
  rawPhoneValues: RawPhoneValues
  swipeAnimationMs: number
  swipeThresholdRatio: number
  swipeCommitRatio: number
  hysteresis: number
  buttonLock: boolean
}

export const APP_CONFIG: AppConfig = {
  debugMode: import.meta.env.VITE_DEBUG === 'true',

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