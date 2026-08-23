export const capabilities_DEFAULT = {
  press: {
    isPressable: true,
    isSwipeable: false,
    isInstantSwipe: false
  },
  swipe: {
    isPressable: true,
    isSwipeable: true,
    isInstantSwipe: false
  },
  instant: {
    isPressable: false,
    isSwipeable: true,
    isInstantSwipe: true
  }
} as const