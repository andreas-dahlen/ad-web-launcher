import { useRef } from "react"
import { usePointerBridge } from "../../../hooks/usePointerBridge.ts"
import { useScrollSizing } from '@components/primitives/scroll/hooks/useScrollSizing.ts'
import { useScrollStore } from '@components/primitives/scroll/hooks/useScrollStore.ts'
import type { ScrollProps } from '@typeScript/propsType.ts'
import { useScrollMotion } from '@components/primitives/scroll/hooks/useScrollMotion.ts'
import { useOverflowMotion } from '@components/primitives/scroll/hooks/useOverflowMotion.ts'
import scrollCss from './Scroll.module.css'
import clsx from 'clsx'
import { dasx } from '../../../data/dataAttrs.ts'

export default function Scroll({
  id,
  axis,
  interactive = true,
  instantSwipe = true,
  className,
  children,
  scrollDataAttrs,
  onEdgeDir,
  isInitialVisible = false
}: ScrollProps) {

  // ── Fully subscribe to the slider store ─────────────────────────────
  const { overflowValue, liveValue, dragging } = useScrollStore(id, isInitialVisible)

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
      className={scrollCss.container}
      style={onEdgeDir ? overflowStyle : undefined}
      ref={containerRef}
      data-frame="scroll"
    >

      <div
        className={clsx(scrollCss.scroll, className)}
        style={{ ...contentStyle, pointerEvents: interactive ? 'auto' : 'none' }}
        ref={contentRef}
        {...dasx({
          type: "scroll",
          id,
          axis,
          onEdgeDir,
          instantSwipe,
          ...scrollDataAttrs
        })}
      >
        {onEdgeDir &&
          <div className={scrollCss.knob}
            {...dasx({
              type: "scroll",
              id,
              axis,
              onEdgeDir,
              instantSwipe: false
            })}
          />}

        {children}
      </div>
    </div >
  )
}