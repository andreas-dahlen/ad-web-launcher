// bridge.ts
import { useEffect, RefObject } from 'react'
import { pipeline } from '../core/pipeline.ts'

interface PointerForwardingProps {
  elRef: RefObject<HTMLElement>
  onReaction?: (e: CustomEvent) => void
}

export function usePointerForwarding({ elRef, onReaction }: PointerForwardingProps) {
  useEffect(() => {
    let isActive = false
    let activePointerId: number | null = null

    const el = elRef.current
    if (!el) return

    function handlePointerDown(e: PointerEvent) {
      e.stopPropagation()
      if (isActive) return

      el.setPointerCapture(e.pointerId)
      activePointerId = e.pointerId
      isActive = true

      pipeline.orchestrate({
        eventType: 'down',
        x: e.clientX,
        y: e.clientY,
      })
    }

    function handlePointerMove(e: PointerEvent) {
      if (!isActive) return
      if (e.pointerId !== activePointerId) return

      pipeline.orchestrate({
        eventType: 'move',
        x: e.clientX,
        y: e.clientY,
      })
    }

    function handlePointerUp(e: PointerEvent) {
      if (!isActive) return
      if (e.pointerId !== activePointerId) return

      if (el.hasPointerCapture(e.pointerId)) {
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

    function handleReaction(e: Event) {
      if (!onReaction) return
      onReaction(e as CustomEvent)
    }

    // Add listeners
    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
    el.addEventListener('reaction', handleReaction)

    // Cleanup on unmount
    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerup', handlePointerUp)
      el.removeEventListener('pointercancel', handlePointerUp)
      el.removeEventListener('reaction', handleReaction)
    }
  }, [elRef, onReaction])
}