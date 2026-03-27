import { log } from '@debug/functions.ts'
import { APP_SETTINGS } from '@config/appSettings.ts'
import { store } from './zustandStore.ts'

/* -------------------------
Device info (works for web and APK)
-------------------------- */
interface Device {
  width: number
  height: number
  density: number
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
const device = sanitizeDevice(window.__DEVICE || defaultDevice)
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

export function ensure(): SizeState {
  return store.ensure('sizeState', 'device', { device, 
    ...computeScale(device, window.innerWidth, window.innerHeight) }
  )
}
// -------------------------
// Public API
// -------------------------
/**
 * Update the scale based on current viewport
 */
export function updateSize() {
  const sizeState = ensure()
  const { scale, scaledWidth, scaledHeight } = computeScale(
    sizeState.device,
    window.innerWidth,
    window.innerHeight
  )
     store.mutate('sizeState', 'device', (s) => {
       s.scale = scale
       s.scaledWidth = scaledWidth
       s.scaledHeight = scaledHeight
    })
}
/**
 * Return the size along a given axis
 */
export function getAxisSize(axis: "horizontal" | "vertical") {
  const sizeState = ensure()
  //no need to mutate state?
  return axis === 'horizontal' ? sizeState.scaledWidth : sizeState.scaledHeight
}

/**
 * Normalize a parameter from CSS pixels to device pixels
 */
export function normalizeParameter(parameter: number) {
  const sizeState = ensure()
  //no need to mutate state?
  return parameter / sizeState.scale
}

