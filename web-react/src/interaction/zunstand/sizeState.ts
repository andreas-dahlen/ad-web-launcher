import { log } from '@debug/functions.ts'
import { APP_SETTINGS } from '@config/appSettings.ts'
import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

/* -------------------------
Device info (works for web and APK)
-------------------------- */
interface Device {
  width: number
  height: number
  density: number
}

declare global {
  interface Window {
    __DEVICE?: Partial<Device>
  }
}

export type SizeStore = {
  device: Device,
  scale: number,
  scaledWidth: number,
  scaledHeight: number,
  init: () => void,
  update: () => void

}
// -------------------------
// consts
// -------------------------
const defaultDeviceRaw = APP_SETTINGS.rawPhoneValues
const defaultDevice: Device = {
  width: defaultDeviceRaw.width / defaultDeviceRaw.density,
  height: defaultDeviceRaw.height / defaultDeviceRaw.density,
  density: defaultDeviceRaw.density
}

export const sizeStore = create<SizeStore>()(
  immer((set, get) => {
    // Init state with defaults
    const device = sanitizeDevice(window.__DEVICE || defaultDevice)
    const { scale, scaledWidth, scaledHeight } = computeScale(
      device,
      window.innerWidth,
      window.innerHeight
    )

    return {
      device,
      scale,
      scaledWidth,
      scaledHeight,

      // initialize / reset
      init: () => {
        const s = get()
        if (s.device) return  // guard: already initialized

        const device = sanitizeDevice(window.__DEVICE || defaultDevice)
        const { scale, scaledWidth, scaledHeight } = computeScale(
          device,
          window.innerWidth,
          window.innerHeight
        )
        set(state => {
          state.device = device
          state.scale = scale
          state.scaledWidth = scaledWidth
          state.scaledHeight = scaledHeight
        })
      },

      // update on resize
      update: () => {
        const { scale, scaledWidth, scaledHeight } = computeScale(
          get().device,
          window.innerWidth,
          window.innerHeight
        )
        set(s => {
          s.scale = scale
          s.scaledWidth = scaledWidth
          s.scaledHeight = scaledHeight
        })
      }
    }
  })
)
/**
 * Validate that a device payload has numeric, finite dimensions/density.
*/
// -------------------------
// Internal helpers
// -------------------------
function sanitizeDevice(payload?: Partial<Device>): Device {
  if (!payload) return defaultDevice

  const width = Number(payload.width)
  const height = Number(payload.height)
  const density = Number(payload.density)

  if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(density) || density <= 0) {
    log('scale', '[sizeState] Invalid __DEVICE payload, falling back to defaults', payload)
    return defaultDevice
  }
  return Object.freeze({ width, height, density })
}
/**
 * Compute scale and scaled dimensions from a given device and viewport
*/
function computeScale(dev: Device, vw: number, vh: number) {
  let scale = dev.height ? vh / dev.height : 1
  if (dev.width * scale > vw) scale = dev.width ? vw / dev.width : scale
  if (!Number.isFinite(scale) || scale <= 0) {
    log("scale", "[sizeState] Invalid scaleFactor computed, defaulting to 1")
    scale = 1
  }
  return {
    scale,
    scaledWidth: dev.width * scale,
    scaledHeight: dev.height * scale
  }
}
// -------------------------
// Public API
// -------------------------
/**
 * Return the size along a given axis
 */
export function getAxisSize(axis: "horizontal" | "vertical") {
  const s = sizeStore.getState()
  //no need to mutate state?
  return axis === 'horizontal' ? s.scaledWidth : s.scaledHeight
}

/**
 * Normalize a parameter from CSS pixels to device pixels
 */
export function normalizeParameter(parameter: number) {
  const s = sizeStore.getState()
  return parameter / s.scale
}

//for react components
export const useSize = () => {
  // run init only once on mount
  useEffect(() => {
    sizeStore.getState().init()
  }, [])

  return sizeStore(
    useShallow(s => ({
      scale: s.scale,
      scaledWidth: s.scaledWidth,
      scaledHeight: s.scaledHeight,
      device: s.device
    }))
  )
}



//     {
//     scale: sizeStore(s => s.scale),
//     scaledWidth: sizeStore(s => s.scaledWidth),
//     scaledHeight: sizeStore(s => s.scaledHeight),
//     device: sizeStore(s => s.device)
//   }
// }

//   return carouselStore(
//     useShallow(s => {
//       const c = s.carouselStore[id]
//       return {
//         index: c.index,
//         count: c.count,
//         offset: c.offset,
//         dragging: c.dragging,
//         size: c.size
//       }
//     })
//   )
// }