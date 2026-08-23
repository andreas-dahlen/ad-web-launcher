import { useRef } from "react"
import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook.ts'
import { useScrollSizing } from './hooks/useScrollSizing.hook.ts'
import { useScrollMotion } from './hooks/useScrollMotion.hook.ts'
import { useOverflowMotion } from './hooks/useOverflowMotion.hook.ts'
import { useScrollStore } from './store/useScrollStore.hook.ts'
import css from './Scroll.module.css'
import clsx from 'clsx'
import { dasx } from '../../shared/sxCompiler/dasx.ts'
import { svsx } from '../../shared/sxCompiler/svsx.ts'
import type { ScrollPrimProps } from '@primitives/types/prim.types.ts'

import { cpsx } from '../../shared/sxCompiler/cpsx.ts'
import { scrollStyle } from '@shared/generated/tokenModules/scroll.token.ts'
import { scrollPreset } from '@generated/presets/scroll.preset.ts'

export default function ScrollPrim({
  id,
  axis,
  overflowSide,
  isInitialVisible = false,
  interactive = true,
  instantSwipe = true,
  isInFlow = false,
  presets,
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
      // style={overflowSide ? overflowStyle : undefined}
      style={{
        transform: overflowStyle ? overflowStyle.transform : undefined,
        transition: overflowStyle ? overflowStyle.transition : undefined,
        position: isInFlow ? "relative" : "absolute"
      }}
      ref={containerRef}
      data-frame="scroll"
    >

      <div
        className={clsx(css.scroll, ...cpsx(presets, scrollPreset))}
        style={{
          ...contentStyle, pointerEvents: interactive ? 'auto' : 'none',
          ...svsx(styleVars ?? {}, scrollStyle)
        }}
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