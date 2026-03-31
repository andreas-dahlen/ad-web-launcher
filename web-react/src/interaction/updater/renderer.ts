// renderer.ts
import type { ButtonDescriptor, Descriptor } from '@interaction/types/meta'
import type { EventType } from '@interaction/types/primitives'
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

function dispatchEvent(element: HTMLElement, descriptor: Descriptor) {
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
  handle(desc: Descriptor) {
    if (!desc.base.element) return

    //1️⃣ Handle optional extra events
    if (desc.type !== 'button') {
      handleExtras(desc)
    }

    // 2️⃣ Apply DOM / UI attributes
    if (desc.base.event) {
      typeHandlers[desc.base.event]?.(desc.base.element)
    }

    // 3️⃣ Dispatch custom event
    dispatchEvent(desc.base.element, desc)
  }
}

function handleExtras(desc: Exclude<Descriptor, ButtonDescriptor>) {
  const cancel = desc.cancel
  if (!cancel?.pressCancel) return
  if (desc.base.event !== 'swipeStart') return

  const event = 'pressCancel'
  typeHandlers[event]?.(cancel.element)
  dispatchEvent(cancel.element, desc)
}