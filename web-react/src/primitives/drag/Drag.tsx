import { useRef } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.hook.ts'
import { useDragSizing } from './hooks/useDragSizing.hook.ts'
import { useDragMotion } from './hooks/useDragMotion.hook.ts'
import { useDragStore } from './store/useDragStore.hook.ts'
import type { DragProps } from '@primitives/prim.types.ts'
import { useSettingsStore } from '@hooks/useSettingsStore.hook.ts'
import { createPortal } from 'react-dom'
import dragCss from './Drag.module.css'
import clsx from 'clsx'
import { dasx } from '../../shared/utils/dataAttrs.ts'

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
  const { settledOffset, liveOffset, dragging, layout, frameRect } = useDragStore(id)
  const { settings } = useSettingsStore()

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
      if (reaction.detail === 'swipeCommit' && onSwipeCommit) {
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

  const resolvedSnapX = settings.snapEnabled && useSettingsSnap ? settings.dragSnapX : snapX
  const resolvedSnapY = settings.snapEnabled && useSettingsSnap ? settings.dragSnapY : snapY

  return (
    <>
      <div
        ref={containerRef}
        className={dragCss.container}
        data-frame='drag'
      >
        <div
          className={clsx(dragCss.drag, className)}
          style={{ ...motionStyle, pointerEvents: interactive ? 'auto' : 'none' }}
          ref={dragItemRef}
          {...dasx({
            id,
            type: "drag",
            axis: "both",
            snapX: resolvedSnapX,
            snapY: resolvedSnapY,
            ...dragDataAttrs
          })}
        >
          {children}
        </div >
      </div>
      {mirrorSlot && dragging && createPortal(
        <div
          className={dragCss.container}
          data-frame='drag'
          style={{
            width: layout.containerSize.width,
            height: layout.containerSize.height,
            top: frameRect.top,
            // left: frame.left
          }}
        >
          <div
            style={{ ...motionStyle, pointerEvents: 'none' }}
            className={clsx(dragCss.drag, className)}
            {...dragDataAttrs}
          >
            {children}
          </div >
        </div>
        , mirrorSlot)}
    </>
  )
}