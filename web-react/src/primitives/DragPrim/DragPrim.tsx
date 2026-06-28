import { useRef } from "react"
import { settingsStore } from '@stores/settings.store.ts'
import { usePointerBridge } from '@hooks/usePointerBridge.hook.ts'
import { useDragSizing } from './hooks/useDragSizing.hook.ts'
import { useDragMotion } from './hooks/useDragMotion.hook.ts'
import { useDragStore } from './store/useDragStore.hook.ts'
import { createPortal } from 'react-dom'
import css from './DragPrim.module.css'
import clsx from 'clsx'
import { dasx } from '@utils/dataAttrs.ts'
import type { DragProps } from '@primitives/prim.types.ts'

export default function DragPrim({
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
  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const dragSnapX = settingsStore(s => s.settings.dragSnapX)
  const dragSnapY = settingsStore(s => s.settings.dragSnapY)

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

  const resolvedSnapX = snapEnabled && useSettingsSnap ? dragSnapX : snapX
  const resolvedSnapY = snapEnabled && useSettingsSnap ? dragSnapY : snapY

  return (
    <>
      <div
        ref={containerRef}
        className={css.container}
        data-frame='drag'
      >
        <div
          className={clsx(css.drag, className)}
          style={{ ...motionStyle, pointerEvents: interactive ? 'auto' : 'none', background: "hotPink" }}
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
          className={css.container}
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
            className={clsx(css.drag, className)}
            {...dragDataAttrs}
          >
            {children}
          </div >
        </div>
        , mirrorSlot)}
    </>
  )
}