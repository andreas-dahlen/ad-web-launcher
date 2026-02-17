// bridge.js

import { onMounted, onBeforeUnmount } from 'vue'
import { pipeline } from '../core/pipeline' // assuming pipeline is exported

export function usePointerForwarding({ elRef, onReaction }) {
  let isActive = false

  function handlePointerDown(e) {
    e.stopPropagation()
    const el = elRef.value
    if (!el) return

    isActive = true

    pipeline.orchestrate({
      eventType: 'down',
      x: e.clientX,
      y: e.clientY,
      // originalEvent: e
    })

    // Move & up handled globally during active gesture
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  function handlePointerMove(e) {
    if (!isActive) return
    pipeline.orchestrate({
      eventType: 'move',
      x: e.clientX,
      y: e.clientY,
      // originalEvent: e
    })
  }

  function handlePointerUp(e) {
    if (!isActive) return

    pipeline.orchestrate({
      eventType: 'up',
      x: e.clientX,
      y: e.clientY,
      // originalEvent: e
    })

    isActive = false

    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerUp)
  }

  function handleReaction(e) {
    if (!onReaction) return
    onReaction(e)
  }

  onMounted(() => {
    const el = elRef.value
    if (!el) return

    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('reaction', handleReaction)
  })

  onBeforeUnmount(() => {
    const el = elRef.value
    if (!el) return

    el.removeEventListener('pointerdown', handlePointerDown)
    el.removeEventListener('reaction', handleReaction)

    // Safety cleanup in case component unmounts mid-gesture
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerUp)
  })
}