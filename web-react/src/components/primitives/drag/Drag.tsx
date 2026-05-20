import { useRef } from "react"
import { usePointerBridge } from "../../../hooks/usePointerBridge.ts"
import { useDragSizing } from "./hooks/useDragSizing.ts"
import { useDragMotion } from "./hooks/useDragMotion.ts"
import { useDragStore } from "./hooks/useDragStore.ts"
import type { DragProps } from '@typeScript/propsType.ts'
import { useSettingsStore } from '../../../hooks/useSettings.ts'
import { createPortal } from 'react-dom'

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
  const { settledOffset, liveOffset, dragging, frame, layout } = useDragStore(id)
  const { dragEnabled, dragSnapX, dragSnapY, snapEnabled } = useSettingsStore()


  // ── DOM references & sizing ─────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const dragItemRef = useRef<HTMLDivElement>(null)
  useDragSizing({ elRef: dragItemRef, containerRef: containerRef, id })
  const mirrorSlot = document.getElementById("drag-slot")

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
    settledOffset,
    liveOffset,
    dragging
  })

  const resolvedSnapX = snapEnabled && settingsSnap ? dragSnapX : snapX
  const resolvedSnapY = snapEnabled && settingsSnap ? dragSnapY : snapY



  // const item = (
  //   <div
  //     ref={containerRef}
  //     className='drag-container'
  //     data-frame='drag'
  //   >
  //     <div
  //       ref={dragItemRef}
  //       style={{ ...motionStyle, pointerEvents: locked ? 'none' : 'auto' }}
  //       className={`drag ${className ?? ''}`}
  //       data-id={id}
  //       data-axis="both"
  //       data-type="drag"
  //       data-locked={locked || undefined}
  //       data-snap-x={resolvedSnapX}
  //       data-snap-y={resolvedSnapY}
  //     >
  //       {children}
  //     </div >
  //   </div>)

  return (
    <>
      <div
        ref={containerRef}
        className='drag-container'
        data-frame='drag'
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
      {mirrorSlot && dragging && createPortal(
        <div
          className='drag-container'
          style={{
            width: layout.containerSize.x,
            height: layout.containerSize.y,
            top: frame.top,
            // left: frame.left
          }}
        >
          <div
            style={{ ...motionStyle, pointerEvents: 'none', background: 'hotPink' }}
            className={`drag ${className ?? ''}`}
          >
            {children}
          </div >
        </div>
        , mirrorSlot)}
    </>
  )
}