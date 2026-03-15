// import { computed } from 'vue'
import { log } from '../../app/debug/functions.ts'
import { APP_SETTINGS } from '../../app/config/appSettings.ts'

/* -------------------------
   Device info (works for web and APK)
-------------------------- */

// Default phone specs (raw pixels & logical density)
const defaultDeviceRaw = APP_SETTINGS.rawPhoneValues

interface Device {
  width: number
  height: number
  density: number
}

// Compute CSS pixels (same as Kotlin)
const defaultDevice: Device = {
  width: defaultDeviceRaw.width / defaultDeviceRaw.density,
  height: defaultDeviceRaw.height / defaultDeviceRaw.density,
  density: defaultDeviceRaw.density
}

/**
 * Validate that a device payload has numeric, finite dimensions/density.
 */
function sanitizeDevice(payload?: Partial<Device>): Device {
  const fallback = { ...defaultDevice }
  if (!payload) return fallback

  const width = Number(payload.width)
  const height = Number(payload.height)
  const density = Number(payload.density)

  const valid =
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    Number.isFinite(density) &&
    density > 0

  if (!valid) {
    log('scale', '[sizeState] Invalid __DEVICE payload, falling back to defaults', payload)
    return fallback
  }

  return Object.freeze({ width, height, density })
}

// Use injected window.__DEVICE if available (DebugWrapper or APK)
declare global {
  interface Window {
    __DEVICE?: Partial<Device>
  }
}

export const device = computed<Device>(() => sanitizeDevice(window.__DEVICE))

// Compute scaling to fit current viewport (for web)
export const scale = computed<number>(() => {
  const vw = window.innerWidth
  const vh = window.innerHeight

  let scaleFactor = device.value.height ? vh / device.value.height : 1 // height-first
  if (device.value.width * scaleFactor > vw) {
    scaleFactor = device.value.width ? vw / device.value.width : scaleFactor // shrink to fit width
  }

  if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
    log('scale', '[sizeState] Invalid scaleFactor computed, defaulting to 1', {
      scaleFactor,
      vw,
      vh,
      device: device.value
    })
    return 1
  }

  return scaleFactor
})

// CSS pixels * scale for swipe math
const scaledWidth = computed<number>(() => device.value.width * scale.value)
const scaledHeight = computed<number>(() => device.value.height * scale.value)

/**
 * Get the scaled size along a specific axis
 */
export function getAxisSize(axis: 'horizontal' | 'vertical'): number {
  if (axis === 'horizontal') return scaledWidth.value
  if (axis === 'vertical') return scaledHeight.value
  return 0
}

/**
 * Normalize a parameter from CSS pixels to device pixels
 */
export function normalizeParameter(parameter: number): number {
  return parameter / scale.value
}

// Optionally, clamp numbers if needed
// export function clampNumber(value: number, min = 0, max = 1): number {
//   const v = Number.isFinite(value) ? value : min
//   return Math.min(Math.max(v, min), max)
// }