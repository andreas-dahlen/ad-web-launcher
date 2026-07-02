import { useRef } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.hook.ts'
import { useScrollSizing } from './hooks/useScrollSizing.hook.ts'
import { useScrollMotion } from './hooks/useScrollMotion.hook.ts'
import { useOverflowMotion } from './hooks/useOverflowMotion.hook.ts'
import { useScrollStore } from './store/useScrollStore.hook.ts'
import css from './ScrollPrim.module.css'
import clsx from 'clsx'
import { dasx } from '@utils/dasx.ts'
import { stsx } from '@utils/slsx.ts'
import type { ScrollPrimProps } from '@primitives/prim.types.ts'
import { scrollVars } from '@primitives/ScrollPrim/ScrollPrim.vars.ts'

export default function ScrollPrim({
  id,
  axis,
  overflowSide,
  isInitialVisible = false,
  interactive = true,
  instantSwipe = true,
  className,
  children,
  scrollDataAttrs,
  styleVars
}: ScrollPrimProps) {

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
      className={css.container}
      style={overflowSide ? overflowStyle : undefined}
      ref={containerRef}
      data-frame="scroll"
    >

      <div
        className={clsx(css.scroll, className)}
        style={{ ...contentStyle, pointerEvents: interactive ? 'auto' : 'none', ...stsx(styleVars ?? {}, scrollVars) }}
        ref={contentRef}
        {...dasx({
          type: "scroll",
          id,
          axis,
          overflowSide,
          instantSwipe,
          ...scrollDataAttrs
        })}
      >
        {overflowSide &&
          <div className={css.knob}
            {...dasx({
              type: "scroll",
              id,
              axis,
              overflowSide,
              instantSwipe: false
            })}
          />}

        {children}
      </div>
    </div >
  )
}