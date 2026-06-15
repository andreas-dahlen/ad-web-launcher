export const capabilities_DEFAULT = {
  press: {
    pressable: true,
    swipeable: false,
    instantSwipe: false
  },
  swipe: {
    pressable: true,
    swipeable: true,
    instantSwipe: false
  },
  instant: {
    pressable: false,
    swipeable: true,
    instantSwipe: true
  }
} as const