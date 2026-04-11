import { useRef } from "react"
import { usePointerBridge } from "../../hooks/pointerBridge.ts"
import { useDragSizing } from "./hooks/useDragSizing.ts"
import { useDragMotion } from "./hooks/useDragMotion.ts"
import { useDragStore } from "./hooks/useDragStore.ts"
import type { DragProps } from '@typeScript/propsType.ts'

export default function Drag({
  id,
  className,
  snapX,
  snapY,
  locked = false,
  reactSwipeCommit = false,
  onSwipeCommit,
  children
}: DragProps) {

  // ── Fully subscribe to the drag store─────────────────────────────
  const { position, offset, dragging } = useDragStore(id)

  // ── DOM references & sizing ─────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const dragItemRef = useRef<HTMLDivElement>(null)
  useDragSizing({ elRef: dragItemRef, containerRef: containerRef, id })

  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerBridge({
    elRef: dragItemRef,
    disabled: locked,
    onReaction: (reaction) => {
      if (!reactSwipeCommit) return
      if (reaction.detail?.event === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Drag motion / styling ─────────────────────────────
  const { itemStyle } = useDragMotion({
    position,
    offset,
    dragging
  })

  return (
    <div
      ref={containerRef}
      className='relative-max-size non-interactive'

    >
      <div
        ref={dragItemRef}
        style={itemStyle}
        className={`drag-item ${className}`}
        data-id={id}
        data-axis="both"
        data-type="drag"
        data-locked={locked || undefined}
        data-snap-x={snapX}
        data-snap-y={snapY}
        data-react-swipe-commit={reactSwipeCommit ? true : undefined}
      >
        {children}
      </div>
    </div>
  )
}