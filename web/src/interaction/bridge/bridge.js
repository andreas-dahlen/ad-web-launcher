// bridge.js

import { onMounted, onBeforeUnmount } from 'vue'
import { pipeline } from '../core/pipeline'

export function usePointerForwarding({ elRef, onReaction }) {
  let isActive = false
  let activePointerId = null

  function handlePointerDown(e) {
    e.stopPropagation()
    if (isActive) return
    const el = elRef.value
    if (!el) return

    el.setPointerCapture(e.pointerId)

    activePointerId = e.pointerId
    isActive = true

    pipeline.orchestrate({
      eventType: 'down',
      x: e.clientX,
      y: e.clientY,
    })

    // Move & up handled globally during active gesture
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  function handlePointerMove(e) {
    if (!isActive) return
    if (e.pointerId !== activePointerId) return
    pipeline.orchestrate({
      eventType: 'move',
      x: e.clientX,
      y: e.clientY,
    })
  }

  function handlePointerUp(e) {
    if (!isActive) return
   if (e.pointerId !== activePointerId) return

  const el = elRef.value
  if (el?.hasPointerCapture(e.pointerId)) {
    el.releasePointerCapture(e.pointerId)
  }

    pipeline.orchestrate({
      eventType: 'up',
      x: e.clientX,
      y: e.clientY,
    })

    isActive = false
    activePointerId = null
  }

  function handleReaction(e) {
    if (!onReaction) return
    onReaction(e)
  }

  onMounted(() => {
    const el = elRef.value
    if (!el) return

    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
    el.addEventListener('reaction', handleReaction)
  })

  onBeforeUnmount(() => {
    const el = elRef.value
    if (!el) return

    el.removeEventListener('pointerdown', handlePointerDown)
    el.removeEventListener('pointermove', handlePointerMove)
    el.removeEventListener('pointerup', handlePointerUp)
    el.removeEventListener('pointercancel', handlePointerUp)
    el.removeEventListener('reaction', handleReaction)
  })
}