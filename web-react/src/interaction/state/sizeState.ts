import { log } from '../../app/debug/functions.ts'
import { APP_SETTINGS } from '../../app/config/appSettings.ts'
import { createStore } from './stateReactAdapter.ts'

/* -------------------------
   Device info (works for web and APK)
-------------------------- */

interface Device {
  width: number
  height: number
  density: number
}

interface SizeState {
  device: Device
  scale: number
  scaledWidth: number
  scaledHeight: number
}

// -------------------------
// Defaults
// -------------------------

const defaultDeviceRaw = APP_SETTINGS.rawPhoneValues

const defaultDevice: Device = {
  width: defaultDeviceRaw.width / defaultDeviceRaw.density,
  height: defaultDeviceRaw.height / defaultDeviceRaw.density,
  density: defaultDeviceRaw.density
}

/**
 * Validate that a device payload has numeric, finite dimensions/density.
 */
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

// Use injected window.__DEVICE if available
declare global {
  interface Window {
    __DEVICE?: Partial<Device>
  }
}

const device = sanitizeDevice(window.__DEVICE || defaultDevice)

// -------------------------
// Internal helpers
// -------------------------

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
// Initial store
// -------------------------

const initial = computeScale(device, window.innerWidth, window.innerHeight)

export const useSizeState = createStore<SizeState>({
  device,
  ...initial
})

// -------------------------
// Public API
// -------------------------

/**
 * Update the scale based on current viewport
 */
export function updateSize() {
  useSizeState.setState((s) => {
    const { scale, scaledWidth, scaledHeight } = computeScale(
      s.device,
      window.innerWidth,
      window.innerHeight
    )

    s.scale = scale
    s.scaledWidth = scaledWidth
    s.scaledHeight = scaledHeight
  })
}

/**
 * Return the size along a given axis
 */
export function getAxisSize(axis: "horizontal" | "vertical") {
  const { scaledWidth, scaledHeight } = useSizeState.getSnapshot()
  return axis === "horizontal" ? scaledWidth : scaledHeight
}

/**
 * Normalize a parameter from CSS pixels to device pixels
 */
export function normalizeParameter(parameter: number) {
  const s = useSizeState.getSnapshot()
  return parameter / s.scale
}