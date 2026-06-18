export const data_DEFAULT = {
  carousel: {
    currentScene: 3, lockSwipeAt: { prev: 0, next: 5 }
  },
  drag: {
    settledOffset: { x: 0, y: 0 },
    constraints: {
      minX: 0,
      maxX: 100,
      minY: 0,
      maxY: 100
    },
    snap: { x: 100, y: 100 },
  },
  slider: {
    constraints: { min: 0, max: 99 }
  },
  scroll: {
    settledValue: 0,
    isVisible: true,
    onEdgeDir: 'up'
  }
} as const