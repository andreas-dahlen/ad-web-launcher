/**
 * inputSource.js - Platform input routing
 *
 * Responsibilities:
 * - Initialize Android bridge (window.handleTouch) when on Android
 * - Export onDown/onMove/onUp for Vue components to forward raw coordinates
 * - Route raw (x, y) to intentDeriver
 *
 * DOM listener attachment is owned by Vue components (see gesture_contract_v2.md).
 * This module does NOT attach browser pointer listeners.
 */

import { APP_SETTINGS } from '../../config/appSettings'
import { log } from '../../debug/functions'
import { intentDeriver } from './intentDeriver'

let currentSeqId = 0

let initialized = false

/**
 * Initialize platform-specific bridge (Android only).
 * Browser pointer listeners are owned by Vue components.
 */
export function initPlatformBridge() {
  if (initialized) return
  initialized = true

  if (APP_SETTINGS.platform === 'android') {
    initAndroidInput()
  }

  log('init', `Platform bridge initialized (${APP_SETTINGS.platform})`)
}

function initAndroidInput() {
  window.handleTouch = handleAndroidTouch
  log('init', 'Initialized in Android mode')
}

window.initAndroidEngine = () => {
  log('init', 'Android engine confirmed')
  return 'success'
}

function handleAndroidTouch(type, x, y, seqId) {
  if (type === 'down') {
    currentSeqId = seqId
  } else if (seqId !== currentSeqId) {
    return
  }

  switch (type) {
    case 'down':
      intentDeriver.onDown(x, y)
      break
    case 'move':
      intentDeriver.onMove(x, y)
      break
    case 'up':
      intentDeriver.onUp(x, y)
      break
  }
}

/**
 * Forwarding API for Vue components.
 * Components extract (x, y) from DOM events and call these.
 */
export function onDown(x, y) {
  intentDeriver.onDown(x, y)
}

export function onMove(x, y) {
  intentDeriver.onMove(x, y)
}

export function onUp(x, y) {
  intentDeriver.onUp(x, y)
}
