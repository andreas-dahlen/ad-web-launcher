// renderer.js
/**
 * Single choke point for applying reactions to state.
 *
 * Contract:
 * - Receives descriptors with optional reaction payloads
 * - Applies carousel reactions to carouselState
 * - Applies drag reactions to dragState
 * - Applies slider reactions to sliderState
 * - Does NOT contain decision logic
 */

/* -------------------------------------------------
   DOM helpers
------------------------------------------------- */
function setAttr(element, key, value) {
  if (!element) return
  if (value === null || value === undefined || value === false) {
    element.removeAttribute(key)
  } else {
    element.setAttribute(key, String(value))
  }
}

function dispatchEvent(element, descriptor) {
  if (!element) return
  element.dispatchEvent(new CustomEvent('reaction', { detail: descriptor }))
}

/* -------------------------------------------------
   DOM / UI attribute handlers
------------------------------------------------- */
const typeHandlers = {
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
  handle(descriptor) {
    if (!descriptor || !descriptor.element) return

    // 2️⃣ Apply DOM / UI attributes
    typeHandlers[descriptor.type]?.(descriptor.element)

    // 3️⃣ Dispatch custom event
    dispatchEvent(descriptor.element, descriptor)
  }
}
