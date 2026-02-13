// usePointerForwarding.js

import { onMounted, onBeforeUnmount } from 'vue'
import { intentDeriver } from './intentDeriver'
import { buildContext } from '../context/contextBuilder'

export function usePointerForwarding({ elRef, reactions, onReaction }) {

  function handlePointerDown(e) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)

    const ctx = buildContext(e.currentTarget, reactions)
    if (!ctx) return
    console.log(ctx)
    intentDeriver.onDown(e.clientX, e.clientY, ctx)
  }

  function handlePointerMove(e) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    intentDeriver.onMove(e.clientX, e.clientY)
  }

  function handlePointerUp(e) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return

     e.currentTarget.releasePointerCapture(e.pointerId)
     
    intentDeriver.onUp(e.clientX, e.clientY)
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
