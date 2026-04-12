import type { CtxType } from '../../typeScript/ctxType.ts'
import type { EventType } from '../../typeScript/primitiveType.ts'
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

function dispatchEvent(element: HTMLElement, ctx: CtxType) {
  element.dispatchEvent(new CustomEvent<CtxType>('reaction', { detail: ctx }))
}

/* -------------------------------------------------
   DOM / UI attribute handlers
------------------------------------------------- */
const typeHandlers: Record<EventType, (el: HTMLElement) => void> = {
  press: (el) => {
    setAttr(el, 'data-swiping', null);
    setAttr(el, 'data-pressed', 'pressed')
  },
  pressRelease: (el) => {
    setAttr(el, 'data-pressed', 'released')
  },
  pressCancel: (el) => {
    setAttr(el, 'data-pressed', 'cancelled')
  },
  swipeStart: (el) => {
    setAttr(el, 'data-pressed', null);
    setAttr(el, 'data-swiping', 'swiping')
  },
  swipeCommit: (el) => {
    setAttr(el, 'data-swiping', 'committed')
  },
  swipeRevert: (el) => {
    setAttr(el, 'data-swiping', 'reverted')
  },
  swipe: () => { }
}

/* -------------------------------------------------
   Render
------------------------------------------------- */
export const domUpdater = {
  handle(ctx: CtxType) {
    if (!ctx.element) return

    //1️⃣ Handle optional extra events
    handleExtras(ctx)

    // 2️⃣ Apply DOM / UI attributes
    typeHandlers[ctx.event]?.(ctx.element)

    // 3️⃣ Dispatch custom event
    dispatchEvent(ctx.element, ctx)
  }
}

function handleExtras(ctx: CtxType) {
  if (ctx.type === 'button') return
  const cancel = ctx.cancel
  if (!cancel?.pressCancel) return

  const event = 'pressCancel'
  typeHandlers[event]?.(cancel.element)
  dispatchEvent(cancel.element, { ...ctx, event })
}