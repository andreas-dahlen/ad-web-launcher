import { useRef } from "react"
import { usePointerBridge } from "../../hooks/pointerBridge.ts"
import { useDragSizing } from "./hooks/useDragSizing.ts"
import { useDragMotion } from "./hooks/useDragMotion.ts"
import { useDragStore } from "./hooks/useDragStore.ts"
import type { DragProps } from '@typeScript/propsType.ts'
import { useSettingsStore } from '@config/settingsHooks/useSettings.ts'

export default function Drag({
  id,
  snapX,
  snapY,
  settingsSnap = false,
  lockable = false,
  onSwipeCommit,
  children,
  className
}: DragProps) {

  // ── Fully subscribe to the drag store─────────────────────────────
  const { position, offset, dragging } = useDragStore(id)
  const { dragEnabled, dragSnapX, dragSnapY } = useSettingsStore()


  // ── DOM references & sizing ─────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const dragItemRef = useRef<HTMLDivElement>(null)
  useDragSizing({ elRef: dragItemRef, containerRef: containerRef, id })

  // ── Pointer forwarding for gestures ─────────────────────────────

  const locked = lockable && !dragEnabled

  usePointerBridge({
    elRef: dragItemRef,
    disabled: locked,
    onReaction: (reaction) => {
      if (reaction.detail?.event === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Drag motion─────────────────────────────
  const { motionStyle } = useDragMotion({
    position,
    offset,
    dragging
  })

  const resolvedSnapX = settingsSnap ? dragSnapX : snapX
  const resolvedSnapY = settingsSnap ? dragSnapY : snapY

  return (
    <div
      ref={containerRef}
      className='drag-container'
    >

      <div
        ref={dragItemRef}
        style={{ ...motionStyle, pointerEvents: locked ? 'none' : 'auto' }}
        className={`drag ${className ?? ''}`}
        data-id={id}
        data-axis="both"
        data-type="drag"
        data-locked={locked || undefined}
        data-snap-x={resolvedSnapX}
        data-snap-y={resolvedSnapY}
      >
        {children}
      </div >
    </div>
  )
}