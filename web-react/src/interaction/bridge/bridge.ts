import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { pipeline } from '../core/pipeline.ts'

interface PointerForwardingProps {
  elRef: RefObject<HTMLElement | null>
  disabled?: boolean
  onReaction?: (e: CustomEvent) => void
}

export function usePointerForwarding({ elRef, onReaction, disabled }: PointerForwardingProps) {
  const isActive = useRef(false)
  const activePointerId = useRef<number | null>(null)

  useEffect(() => {
    if (!disabled) return

    const el = elRef.current

    if (isActive.current && activePointerId.current !== null) {
      // Finish gesture cleanly in your system
      pipeline.orchestrate({
        eventType: 'up',
        x: 0,
        y: 0,
      })

      // Release DOM capture if it exists
      if (el) {
        try {
          if (el.hasPointerCapture(activePointerId.current)) {
            el.releasePointerCapture(activePointerId.current)
          }
        } catch (err) {
          console.warn('Failed to release pointer capture', err)
        }
      }
    }

    isActive.current = false
    activePointerId.current = null
  }, [elRef, disabled])

  useEffect(() => {
    const el = elRef.current
    if (!el || disabled) return

    function handlePointerDown(e: PointerEvent) {
      e.stopPropagation()
      if (isActive.current) return

      el?.setPointerCapture(e.pointerId)

      activePointerId.current = e.pointerId
      isActive.current = true
      pipeline.orchestrate({
        eventType: 'down',
        x: e.clientX,
        y: e.clientY,
      })
    }

    function handlePointerMove(e: PointerEvent) {
      if (!isActive.current) return
      if (e.pointerId !== activePointerId.current) return
      pipeline.orchestrate({
        eventType: 'move',
        x: e.clientX,
        y: e.clientY,
      })
    }

    function handlePointerUp(e: PointerEvent) {
      if (!isActive.current) return
      if (e.pointerId !== activePointerId.current) return

      if (el?.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId)
      }
      pipeline.orchestrate({
        eventType: 'up',
        x: e.clientX,
        y: e.clientY,
      })

      isActive.current = false
      activePointerId.current = null
    }

    function handleReaction(e: Event) {
      onReaction?.(e as CustomEvent)
    }

    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
    el.addEventListener('reaction', handleReaction)

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerup', handlePointerUp)
      el.removeEventListener('pointercancel', handlePointerUp)
      el.removeEventListener('reaction', handleReaction)
    }
  }, [elRef, onReaction, disabled])
}