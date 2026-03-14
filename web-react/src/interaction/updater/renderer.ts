// renderer.ts
import type { Descriptor, EventType } from "../../types/gestures.ts"

/* -------------------------------------------------
   DOM helpers
------------------------------------------------- */
function setAttr(element: HTMLElement | null | undefined, key: string, value: unknown) {
  if (!element) return
  if (value === null || value === undefined || value === false) {
    element.removeAttribute(key)
  } else {
    element.setAttribute(key, String(value))
  }
}

function dispatchEvent(element: HTMLElement | null | undefined, descriptor: Descriptor) {
  if (!element) return
  element.dispatchEvent(new CustomEvent('reaction', { detail: descriptor }))
}

/* -------------------------------------------------
   DOM / UI attribute handlers
------------------------------------------------- */
const typeHandlers: Record<EventType, (el: HTMLElement) => void> = {
  press: (el) => setAttr(el, 'data-pressed', true),
  pressRelease: (el) => setAttr(el, 'data-pressed', null),
  pressCancel: (el) => setAttr(el, 'data-pressed', null),
  swipeStart: (el) => setAttr(el, 'data-swiping', true),
  swipeCommit: (el) => setAttr(el, 'data-swiping', null),
  swipeRevert: (el) => setAttr(el, 'data-swiping', null),
  swipe: () => { }
}

/* -------------------------------------------------
   Render
------------------------------------------------- */
export const render = {
  handle(descriptor?: Descriptor) {
    if (!descriptor?.base.element) return

    // 2️⃣ Apply DOM / UI attributes
    if (descriptor.runtime.event) {
      typeHandlers[descriptor.runtime.event]?.(descriptor.base.element)
    }

    // 3️⃣ Dispatch custom event
    dispatchEvent(descriptor.base.element, descriptor)
  }
}