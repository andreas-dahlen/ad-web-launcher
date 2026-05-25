import { useRef } from "react"
import { usePointerBridge } from "../../../hooks/usePointerBridge.ts"
import { useDragSizing } from "./hooks/useDragSizing.ts"
import { useDragMotion } from "./hooks/useDragMotion.ts"
import { useDragStore } from "./hooks/useDragStore.ts"
import type { DragProps } from '@typeScript/propsType.ts'
import { useSettingsStore } from '../../../hooks/useSettingsStore.ts'
import { createPortal } from 'react-dom'

export default function Drag({
  id,
  snapX,
  snapY,
  useSettingsSnap = false,
  interactive = true,
  onSwipeCommit,
  children,
  className,
  dragDataAttrs
}: DragProps) {

  // ── Fully subscribe to the drag store─────────────────────────────
  const { settledOffset, liveOffset, dragging, frame, layout } = useDragStore(id)
  const { dragSnapX, dragSnapY, isSnapEnabled } = useSettingsStore()

  // ── DOM references & sizing ─────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const dragItemRef = useRef<HTMLDivElement>(null)
  useDragSizing({ elRef: dragItemRef, containerRef: containerRef, id })

  const mirrorSlot = document.getElementById("drag-slot")
  // ── Pointer forwarding for gestures ─────────────────────────────

  usePointerBridge({
    elRef: dragItemRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.detail?.event === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Drag motion─────────────────────────────
  const { motionStyle } = useDragMotion({
    settledOffset,
    liveOffset,
    dragging
  })

  const resolvedSnapX = isSnapEnabled && useSettingsSnap ? dragSnapX : snapX
  const resolvedSnapY = isSnapEnabled && useSettingsSnap ? dragSnapY : snapY

  return (
    <>
      <div
        ref={containerRef}
        className='drag-container'
        data-frame='drag'
      >
        <div
          ref={dragItemRef}
          data-type="drag"
          data-id={id}
          data-axis="both"
          className={`drag ${className ?? ''}`}
          style={{ ...motionStyle, pointerEvents: interactive ? 'auto' : 'none' }}
          // data-locked={interactive || undefined}
          data-snap-x={resolvedSnapX}
          data-snap-y={resolvedSnapY}
          {...dragDataAttrs}
        >
          {children}
        </div >
      </div>
      {mirrorSlot && dragging && createPortal(
        <div
          className='drag-container'
          data-frame='drag'
          style={{
            width: layout.containerSize.width,
            height: layout.containerSize.height,
            top: frame.top,
            // left: frame.left
          }}
        >
          <div
            style={{ ...motionStyle, pointerEvents: 'none' }}
            className={`drag ${className ?? ''}`}
            {...dragDataAttrs}
          >
            {children}
          </div >
        </div>
        , mirrorSlot)}
    </>
  )
}