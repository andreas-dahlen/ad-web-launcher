import type { Runtime } from '@interaction/types/runtime/runtime.types.ts'
import type { EventType } from '../../shared/typing/core.types.ts'
// domUpdater.ts
/* -------------------------------------------------
   DOM helpers
------------------------------------------------- */
function setAttr(element: HTMLElement, key: string, value: unknown) {
  if (value === null || value === undefined || value === false) {
    element.removeAttribute(key)
  } else {
    element.setAttribute(key, String(value))
  }
}

//TODO rename emitReaction?? and also 
function dispatchEvent(element: HTMLElement, event: EventType) {
  element.dispatchEvent(new CustomEvent<EventType>('reaction', { detail: event }))
}

//FUTURE SYSTEM DESIGN
// Level 1
// onReaction(event)

// Level 2
// filter/translate event → meaningful primitive state

// Level 3
// onValueChange(value)
// replaceStale()
// openApp()
// setVolume()
// navigate()

/* -------------------------------------------------
   DOM / UI attribute handlers
------------------------------------------------- */
const eventHandlers: Record<EventType, (el: HTMLElement) => void> = {
  press: (el) => {
    setAttr(el, 'data-state', 'pressed')
  },
  pressRelease: (el) => {
    setAttr(el, 'data-state', 'released')
  },
  pressCancel: (el) => {
    setAttr(el, 'data-state', 'cancelled')
  },
  swipeStart: (el) => {
    setAttr(el, 'data-state', 'swiping')
  },
  swipeCommit: (el) => {
    setAttr(el, 'data-state', 'committed')
  },
  swipeRevert: (el) => {
    setAttr(el, 'data-state', 'reverted')
  },
  swipe: () => { }
}

/* -------------------------------------------------
   Render
------------------------------------------------- */
export const domUpdater = {
  handle(runtime: Runtime, el: HTMLElement) {
    if (!el) return

    //1️⃣ Handle optional extra events
    handleExtras(runtime)

    // 2️⃣ Apply DOM / UI attributes
    eventHandlers[runtime.event]?.(el)

    // 3️⃣ Dispatch custom event
    dispatchEvent(el, runtime.event)
  }
}

function handleExtras(runtime: Runtime) {
  if (runtime.event !== "swipeStart") return
  const cancel = runtime.cancel
  if (!cancel?.pressCancel) return

  const event = 'pressCancel'
  eventHandlers[event]?.(cancel.element)
  dispatchEvent(cancel.element, event)
}