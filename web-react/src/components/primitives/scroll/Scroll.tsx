import { useRef } from "react"
import { usePointerBridge } from "../../../hooks/usePointerBridge.ts"
import { useScrollSizing } from '@components/primitives/scroll/hooks/useScrollSizing.ts'
import { useScrollStore } from '@components/primitives/scroll/hooks/useScrollStore.ts'
import type { ScrollProps } from '@typeScript/propsType.ts'
import { useScrollMotion } from '@components/primitives/scroll/hooks/useScrollMotion.ts'

export default function Scroll({
  id,
  axis,
  interactive = true,
  className,
  children,
  scrollDataAttrs,
  onSwipeCommit,
}: ScrollProps) {

  // ── Fully subscribe to the slider store ─────────────────────────────
  const { liveValue, settledValue, dragging } = useScrollStore(id)

  // ── DOM references & sizing ─────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useScrollSizing({ containerRef: containerRef, contentRef: contentRef, id })

  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerBridge({
    elRef: contentRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.detail?.event === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Slider motion / styling ─────────────────────────────
  const { contentStyle } = useScrollMotion({
    liveValue,
    settledValue,
    dragging
  })

  return (
    <div
      ref={containerRef}
      data-frame="scroll"
      className="scroll-container"
    >

      <div
        ref={contentRef}
        data-type="scroll"
        data-id={id}
        data-axis={axis}
        className={`scroll ${className ?? ''}`}
        style={{ ...contentStyle, pointerEvents: interactive ? 'auto' : 'none' }}
        {...scrollDataAttrs}
      >
        {children}
      </div>
    </div >
  )
}