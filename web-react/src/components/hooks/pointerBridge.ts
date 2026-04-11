import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { pipeline } from '@interaction/core/pipeline.ts'
import type { ReactionEvent } from '@typeScript/ctxType.ts'
import type { EventBridgeType } from '@typeScript/primitiveType.ts'

export interface PointerEventPackage {
  readonly eventType: EventBridgeType
  readonly x: number
  readonly y: number
  readonly pointerId: number
}

interface PointerForwardingProps {
  elRef: RefObject<HTMLElement | null>
  disabled?: boolean
  onReaction?: (e: ReactionEvent) => void
}

export function usePointerBridge({ elRef, onReaction, disabled }: PointerForwardingProps) {
  const isActive = useRef(false)
  const activePointerId = useRef<number | null>(null)
  const onReactionRef = useRef(onReaction)
  useEffect(() => {
    onReactionRef.current = onReaction
  }, [onReaction])

  useEffect(() => {
    if (!disabled) return

    const el = elRef.current

    if (isActive.current && activePointerId.current !== null) {
      pipeline.abortGesture(activePointerId.current) // cleanly abort
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

      try {
        el?.setPointerCapture(e.pointerId)
      } catch (err) {
        console.warn('Failed to set pointer capture', err)
      }

      activePointerId.current = e.pointerId
      isActive.current = true
      pipeline.orchestrate({
        eventType: 'down',
        x: e.clientX,
        y: e.clientY,
        pointerId: e.pointerId
      })
    }

    function handlePointerMove(e: PointerEvent) {
      if (!isActive.current) return
      if (e.pointerId !== activePointerId.current) return
      pipeline.orchestrate({
        eventType: 'move',
        x: e.clientX,
        y: e.clientY,
        pointerId: e.pointerId
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
        pointerId: e.pointerId
      })

      isActive.current = false
      activePointerId.current = null
    }

    function handlePointerCancel(e: PointerEvent) {
      if (!isActive.current) return
      if (e.pointerId !== activePointerId.current) return

      if (el?.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId)
      }

      pipeline.abortGesture(e.pointerId)
      isActive.current = false
      activePointerId.current = null
    }

    function handleReaction(e: Event) {
      if (onReactionRef.current && e instanceof CustomEvent) {
        onReactionRef.current(e as ReactionEvent)
      }
    }

    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerCancel)
    el.addEventListener('reaction', handleReaction)

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerup', handlePointerUp)
      el.removeEventListener('pointercancel', handlePointerCancel)
      el.removeEventListener('reaction', handleReaction)

      if (isActive.current && activePointerId.current !== null) {
        pipeline.abortGesture(activePointerId.current)
        isActive.current = false
        activePointerId.current = null
      }
    }
  }, [elRef, disabled])
}