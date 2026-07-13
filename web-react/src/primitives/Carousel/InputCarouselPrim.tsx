import { useRef } from "react"
import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook.ts'
import { useContainerSizing } from './hooks/useContainerSizing.hook.ts'
import css from './CarouselPrim.module.css'
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
  //useCarouselSIzing needs to be split in two... inputCarousel owns containerRef and itemRef is owned by ContentRef...

  // ── Pointer forwarding for gestures ──────────────────────────────────────
  usePointerBridge({
    elRef: containerRef,
    disabled: false,
    onReaction: (reaction) => {
      if (reaction.detail === 'swipeCommit' && onSwipeCommit) {
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