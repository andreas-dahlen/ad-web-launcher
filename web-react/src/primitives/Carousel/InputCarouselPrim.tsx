import { useRef } from "react"
import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook.ts'
import { useContainerSizing } from './hooks/useContainerSizing.hook.ts'
import css from './Carousel.module.css'
import { dasx } from '../../shared/sxCompiler/dasx.ts'
import type { InputCarouselPrimProps } from '@primitives/types/prim.types.ts'

export default function InputCarouselPrim({
  id,
  axis,
  lockPrevAt,
  lockNextAt,
  onSwipeCommit
}: InputCarouselPrimProps) {

  // ── DOM reference & lane size ──────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)

  useContainerSizing({ elRef: containerRef, id })

  // ── Pointer forwarding for gestures ──────────────────────────────────────
  usePointerBridge({
    elRef: containerRef,
    disabled: false,
    onReaction: (reaction) => {
      if (onSwipeCommit && reaction.detail === 'swipeCommit') {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  return (
    <div
      className={css.carousel}
      style={{ pointerEvents: "auto" }}
      ref={containerRef}
      {...dasx({
        id,
        type: "carousel",
        axis,
        frame: "carousel",
        lockNextAt,
        lockPrevAt,
        // ...carouselDataAttrs
      })}
    >
      <div className={css.scene} />
    </div>
  )
}