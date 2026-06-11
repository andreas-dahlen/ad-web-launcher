import { DEBUG } from './flags.debug.ts'
import type { InteractionType } from '@typing/core.types.ts'
import { mockMetaByType } from '@test/fixtures/domMetaInput.fixture.ts'

type DebugKey = keyof typeof DEBUG.channels

// Universal log function that respects DEBUG settings.
export function log(key: DebugKey, ...args: unknown[]): void {

  //critical channels
  if (DEBUG.channels[key] === 'always') {
    console.log(format(key), ...args)
    return
  }

  // Normal debug-gated logging
  if (!DEBUG.enabled) return
  if (!DEBUG.channels[key]) return

  console.log(format(key), ...args)
}

function format(key: DebugKey): string {
  const time = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  })
  return `[${time}] [${key}]`
}

// Draw using raw screen pixels only.
export function drawDots(x: number, y: number, color: string = 'red'): void {
  if (DEBUG.enabled && DEBUG.channels.drawDots) {
    const dot = document.createElement('div')
    dot.style.position = 'fixed'
    dot.style.left = `${x - 6}px`
    dot.style.top = `${y - 6}px`
    dot.style.width = '12px'
    dot.style.height = '12px'
    dot.style.borderRadius = '50%'
    dot.style.background = color
    dot.style.pointerEvents = 'none'
    dot.style.zIndex = '99999'

    document.body.appendChild(dot)
    setTimeout(() => dot.remove(), 500)
  }
}

////////////////////////
//debug registration
///////////////////////

export function debugRegisterBinding(id: string, storeName: string): void {
  if (!DEBUG.enabled) return
  log('init', `[${storeName}] Registered "${id}"`)
}

export function debugUnregisterBinding(id: string, storeName: string): void {
  if (!DEBUG.enabled) return
  log('init', `[${storeName}] Unregistered "${id}"`)
}


// Pure assertion, never returns anything, narrows type in TS
export function assertType(
  condition: boolean,
  message?: string
): asserts condition {
  if (!condition) {
    const msg = message ?? 'Assertion failed'
    if (import.meta.env.VITE_DEBUG === 'true') {
      throw new Error(msg)
    } else {
      console.warn(msg)
    }
  }
}

// Returns value or fallback depending on debug / prod
export function ensure<T>(
  value: T | null | undefined,
  fallback?: T,
  msg?: string
): T {
  // value is valid → just return
  if (value != null) return value

  const message = msg ?? 'Assertion failed'
  // debug → warn, return fallback if provided
  if (import.meta.env.VITE_DEBUG === 'true') {
    assertType(value != null, msg)
  }
  // prod → crash
  console.warn(message)
  if (fallback !== undefined) return fallback
  // fallback missing → just return value (still nullish)
  return value as T
}


//VITEST test functions

// export function createTestDescriptor(
//   type: InteractionType,
//   metaOps?: MetaDataset,
//   inputOpts?: {
//     x?: number
//     y?: number
//     pointerId?: number
//     overrideDesc?: Partial<Omit<Descriptor, 'type'>>
//   }
// ): Descriptor {

//   const { el, x, y, pointerId } = createResolutionInput(type, metaOps, inputOpts)

//   const base = buildDesc.resolveFromElement(el, x, y, pointerId)
//   if (!base) throw new Error("resolveFromElement failure")

//   const overrides = inputOpts?.overrideDesc ?? {}

//   return {
//     ...base,
//     ...overrides,
//   } as Descriptor
// }


// export function createResolutionInput(
//   type: InteractionType,
//   metaOps?: MetaDataset,
//   inputOpts?: { x?: number; y?: number; pointerId?: number }
// ) {

//   const el = createMetaElByType(type, metaOps)

//   if (!el) throw new Error("element creation failure")

//   return {
//     el,
//     x: inputOpts?.x ?? 10,
//     y: inputOpts?.y ?? 20,
//     pointerId: inputOpts?.pointerId ?? 1,
//   }
// }
type MetaDataset = Record<string, string>
export function createElByType(type: InteractionType, overrides: MetaDataset = {}) {
  const el = document.createElement('div')

  const mockBase = mockMetaByType[type]

  Object.assign(el.dataset, { ...mockBase, ...overrides })

  return el
}

export function createEl(overrides: MetaDataset = {}) {
  const el = document.createElement('div')

  Object.assign(el.dataset, {
    ...overrides
  })

  return el
}

