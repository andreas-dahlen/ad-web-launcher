import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { pipeline } from '@interaction/runtime/pipeline.ts'
import type { ReactionEvent } from '@interaction/types/updater.types.ts'
import type { EventBridgeType } from '../../shared/types/core.types.ts'

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

export function usePointerBridge({
  elRef,
  onReaction,
  disabled
}: PointerForwardingProps) {
  const isActive = useRef(false)
  const activePointerId = useRef<number | null>(null)
  const onReactionRef = useRef(onReaction)

  useEffect(() => {
    onReactionRef.current = onReaction
  }, [onReaction])

  useEffect(() => {
    const el = elRef.current
    if (!el || disabled) return

    function releasePointerCapture(pointerId: number) {
      try {
        if (el?.hasPointerCapture(pointerId)) {
          el.releasePointerCapture(pointerId)
        }
      } catch (error) {
        console.warn('Failed to release pointer capture', error)
      }
    }

    function abortActiveGesture() {
      if (!isActive.current || activePointerId.current === null) {
        return
      }

      const pointerId = activePointerId.current

      pipeline.abortGesture(pointerId)
      releasePointerCapture(pointerId)

      isActive.current = false
      activePointerId.current = null
    }

    function handlePointerDown(e: PointerEvent) {
      e.stopPropagation()

      if (isActive.current) return

      try {
        el?.setPointerCapture(e.pointerId)
      } catch (error) {
        console.warn('Failed to set pointer capture', error)
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

      releasePointerCapture(e.pointerId)

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

      abortActiveGesture()
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

      abortActiveGesture()
    }
  }, [elRef, disabled])
}