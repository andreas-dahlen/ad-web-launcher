import { useRef } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.hook.ts'
import css from './Carousel.module.css'
import { dasx } from '../../shared/utils/dataAttrs.ts'
import type { InputCarouselProps } from '@primitives/prim.types.ts'
import { useContainerSizing } from '@primitives/Carousel/hooks/useContainerSizing.hook.ts'

export default function InputCarousel({
  id,
  axis,
  lockPrevAt,
  lockNextAt,
  onSwipeCommit
}: InputCarouselProps) {

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