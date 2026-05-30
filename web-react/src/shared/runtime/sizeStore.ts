import { log } from '../../test/functions'
import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'
import { APP_CONFIG } from '@config/appConfig.ts'

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

  update: (width: number, height: number) => void,
  normalizeParameter: (parameter: number) => number,

}
// -------------------------
// consts
// -------------------------
const defaultDeviceRaw = APP_CONFIG.rawPhoneValues
const defaultDevice: Device = {
  width: defaultDeviceRaw.width / defaultDeviceRaw.density,
  height: defaultDeviceRaw.height / defaultDeviceRaw.density,
  density: defaultDeviceRaw.density
}

export const sizeStore = create<SizeStore>()(
  immer((set, get) => {
    // Init state with defaults
    const device = sanitizeDevice(window.__DEVICE || defaultDevice)
    const { scale } = computeScale(
      device,
      window.innerWidth,
      window.innerHeight
    )


    return {
      device,
      scale,

      // update on resize
      update: (width, height) => {
        const { scale } = computeScale(
          get().device,
          width,
          height
        )
        set(s => {
          s.scale = scale
        })
      },

      normalizeParameter: (parameter: number) => {
        return parameter / get().scale
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
    scale
  }
}
// -------------------------
// Public API
// -------------------------
/**
/**
 * Normalize a parameter from CSS pixels to device pixels
 */
export function normalizeParameter(parameter: number) {
  return sizeStore.getState().normalizeParameter(parameter)
}

//for react components
export const useSize = () => {
  return sizeStore(
    useShallow(s => ({
      scale: s.scale,
      device: s.device
    }))
  )
}