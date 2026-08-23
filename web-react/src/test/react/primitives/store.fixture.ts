import type { ReactiveSettings } from '@shared/state/stores/settings.store'

// export const dragStore_DEFAULT = {
//   settledOffset: { x: 0, y: 0 },
//   liveOffset: { x: 0, y: 0 },
//   dragging: false,

//   layout: {
//     containerSize: {
//       width: 100,
//       height: 100
//     },
//     itemSize: {
//       width: 100,
//       height: 100
//     }
//   },

//   constraints: {
//     minX: 0,
//     maxX: 300,
//     minY: 0,
//     maxY: 300
//   },

//   frameRect: {
//     top: 0,
//     left: 0
//   }
// }

export const settingsStore_DEFAULT: ReactiveSettings = {
  panelOpen: false,
  settingsMode: 'default',

  layoutMode: 'scenes',
  layoutManagerV: false,
  layoutManagerH: false,

  dragEnabled: false,
  gridVisible: false,
  snapEnabled: true,

  dragSnapX: 8,
  dragSnapY: 16
}