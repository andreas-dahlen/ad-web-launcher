import { useRef } from "react"
import { usePointerBridge } from "../../../hooks/usePointerBridge.ts"
import { useScrollSizing } from '@components/primitives/scroll/hooks/useScrollSizing.ts'
import { useScrollStore } from '@components/primitives/scroll/hooks/useScrollStore.ts'
import type { ScrollProps } from '@typeScript/propsType.ts'
import { useScrollMotion } from '@components/primitives/scroll/hooks/useScrollMotion.ts'
import { useOverflowMotion } from '@components/primitives/scroll/hooks/useOverflowMotion.ts'

export default function Scroll({
  id,
  axis,
  interactive = true,
  instantSwipe = true,
  className,
  children,
  scrollDataAttrs,
  onEdgeDir,
}: ScrollProps) {

  // ── Fully subscribe to the slider store ─────────────────────────────
  const { overflowValue, liveValue, dragging } = useScrollStore(id)

  // ── DOM references & sizing ─────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useScrollSizing({ containerRef: containerRef, contentRef: contentRef, id })



  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerBridge({
    elRef: contentRef,
    disabled: !interactive,
    // onReaction: (reaction) => {
    //   if (reaction.detail?.event === 'swipeCommit' && onEdge && allowedEdgeOverflow) {
    //     onEdge(overflow, allowedEdgeOverflow)
    //   }
    // }
  })

  // ── Slider motion / styling ─────────────────────────────
  const { contentStyle } = useScrollMotion({
    liveValue,
    dragging
  })

  const { overflowStyle } = useOverflowMotion({
    overflowValue,
    dragging
  })

  return (
    <div
      ref={containerRef}
      data-frame="scroll"
      className="scroll-container"
      style={onEdgeDir ? overflowStyle : undefined}

    >

      <div
        ref={contentRef}
        data-type="scroll"
        data-id={id}
        data-axis={axis}
        data-on-edge-dir={onEdgeDir}
        data-instant-swipe={instantSwipe}
        className={`scroll ${className ?? ''}`}
        style={{ ...contentStyle, pointerEvents: interactive ? 'auto' : 'none' }}
        {...scrollDataAttrs}
      >
        {onEdgeDir &&
          <div className='invis-scroll-input-field'
            data-type="scroll"
            data-id={id}
            data-axis={axis}
            data-on-edge-dir={onEdgeDir}
            data-instant-swipe={false}
          />}

        {children}
      </div>
    </div >
  )
}