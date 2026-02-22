export const APP_SETTINGS = {
  debugPanel: import.meta.env.VITE_DEBUG || true,
  DebugWrapper: import.meta.env.VITE_DEBUG || true,

  rawPhoneValues: {
    width: 1272,
    height: 2800,
    density: 3.5
  },
  
  swipeAnimationMs: 250,
  swipeSpeedMultiplier: 1.2,

  swipeThresholdRatio: 0.05,// start of swipe distance
  swipeCommitRatio: 0.2 // commitmant distance on release
}