import type { InteractionType, Size2D, Vec2 } from '@typing/core.types.ts'
import { DEBUG } from './debugFlags.ts'
import type { ButtonDesc, CarouselDesc, Descriptor, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types.ts'
import type { CtxBase, CtxBaseSwipe, CtxButton, CtxCarousel, CtxDrag, CtxScroll, CtxSlider } from '@interaction/types/ctx.types.ts'
import type { CarouselData, DragData, DragModifiers, GestureUpdate, ScrollData, SliderData } from '@interaction/types/data.types.ts'
import type { BaseInteraction, BaseWithSwipe, Capabilities } from '@interaction/types/base.types.ts'

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

export function createMetaEl(overrides: Partial<DOMStringMap> = {}) {
  const el = document.createElement('div')

  Object.assign(el.dataset, overrides)

  return el
}

export function createTestDescriptor(type: InteractionType, vec2: Vec2, size2D: Size2D, number: number): Descriptor {

  const createBase = {
    pointerId: 1,
    element: createMetaEl(),
    id: "test"
  } as BaseInteraction

  const createBaseSwipe = {
    ...createBase,
    axis: type == "drag" ? "both" : "vertical",
    grabOffset: vec2,
    frame: { left: number, top: number, ...size2D }
  } as BaseWithSwipe

  const createCapabilities = {
    pressable: true,
    swipeable: true,
    instantSwipe: false
  } as Capabilities

  const createCarouselData = { index: number, sceneSize: size2D, lockSwipeAt: { prev: number, next: number } } as CarouselData

  const createDragData = {
    settledOffset: vec2,
    layout: {
      deviceSize: size2D,
      containerSize: size2D,
      itemSize: size2D,
      constraints: { minX: 0, minY: 0, maxX: number, maxY: number }
    },
    snap: vec2,
    locked: false //thing this one isn't used anymore. TODO confirm.
  } as DragData & DragModifiers

  const createSliderData = {
    thumbSize: size2D,
    constraints: { min: 0, max: number },
    containerSize: size2D
  } as SliderData

  const createScrollData = {
    settledValue: number,
    containerSize: size2D,
    contentSize: size2D,
    isVisible: true, //always included but not always used... onEdgeDir drives behavior.
    onEdgeDir: 'up'
  } as ScrollData

  const createGestureUpdate = {
    pointerId: number,
    //slider
    sliderStartOffset: number,
    sliderValuePerPixel: number,
    //scroll
    isOverflow: true,
    startOverflowValue: number
  } as GestureUpdate

  const createCtxBase = {
    type: type,
    event: "swipeStart",
    id: "test",
    element: createMetaEl()
  } as CtxBase

  const createCtxSwipe = {
    ...createCtxBase,
    storeAccepted: true,
    delta: vec2,
    cancel: { element: createMetaEl(), pressCancel: true },
    thresholdValue: vec2
  } as CtxBaseSwipe

  const createCtxButton = {
    ...createCtxBase
  } as CtxButton

  const createCtxCarousel = {
    ...createCtxSwipe,
    delta1D: number,
    direction: { axis: "vertical", dir: "up" }
  } as CtxCarousel

  const createCtxSlider = {
    ...createCtxSwipe,
    delta1D: number,
    gestureUpdate: createGestureUpdate
  } as CtxSlider

  const createCtxScroll = {
    ...createCtxSwipe,
    delta1D: number,
    overflowValue: number,
    isVisible: true,
    gestureUpdate: createGestureUpdate
  } as CtxScroll

  const createCtxDrag = {
    ...createCtxSwipe
  } as CtxDrag

  if (type == "button") {
    return {
      base: createBase,
      capabilities: createCapabilities,
      ctx: createCtxBase as CtxButton
    } as ButtonDesc
  }

  if (type == "carousel") {
    return {
      base: createBaseSwipe,
      data: createCarouselData,
      capabilities: createCapabilities
      ctx: createCtxCarousel
    } as CarouselDesc
  }

  if (type == "slider") {
    return {
      base: createBaseSwipe,
      data: createSliderData,
      capabilities: createCapabilities,
      ctx: createCtxSlider
    } as SliderDesc
  }

  if (type == "drag") {
    return {
      base: createBaseSwipe,
      data: createDragData,
      capabilites: createCapabilities
      ctx: createCtxDrag
    } as DragDesc
  }
  if (type == "scroll") {
    return {
      base: createBaseSwipe,
      data: createScrollData,
      capabilities: createCapabilities,
      ctx: createCtxScroll
    } as ScrollDesc
  }
}