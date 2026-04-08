import { useRef, useEffect, useMemo } from "react"
import { usePointerBridge } from '@components/hooks/pointerBridge.ts'
import { useCarouselMotion } from "./hooks/useCarouselMotion.ts"
import { useCarouselSizing } from "./hooks/useCarouselSizing.ts"
import { useAugmentedScenes } from "./hooks/useAugmentedScenes.ts"
import type { SceneRole } from '@interaction/types/primitiveType.ts'
import { useCarouselStore } from '@components/primitives/carousel/hooks/useCarouselStore.ts'
import { carouselStore } from '@interaction/stores/carouselStore.ts'

export interface CarouselProps {
  id: string
  axis: 'horizontal' | 'vertical'
  scenes: React.ComponentType[]
  className?: string
  lockPrevAt?: number
  lockNextAt?: number
  reactSwipeCommit?: boolean
  interactive?: boolean
  onSwipeCommit?: (detail: unknown) => void
}

interface Slot {
  sceneIdx: number
  role: SceneRole
}

export default function Carousel({
  id,
  axis,
  scenes,
  lockPrevAt,
  lockNextAt,
  onSwipeCommit,
  interactive = true
}: CarouselProps) {

  // ── Fully subscribe to the carousel store ─────────────────────────────
  const { settling, index, offset, count, dragging, size } = useCarouselStore(id)

  // ── Initialize count for mirror scenes ─────────────────────────────

  useEffect(() => {
    if (interactive)
      carouselStore.getState().setCount(id, scenes.length)
  }, [id, scenes.length, interactive])

  // ── DOM reference & lane size ─────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null)
  useCarouselSizing({ elRef: carouselRef, axis, id })

  const axisSize = axis === "horizontal" ? size.x : size.y

  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerBridge({
    elRef: carouselRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.detail?.event === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Augmented scenes & stable slot management ─────────────────────────────
  const augmentedScenes = useAugmentedScenes(scenes, interactive, count)
  const total = augmentedScenes.length

  const slots: Slot[] = useMemo(() => {
    const prevIdx = (index - 1 + total) % total
    const nextIdx = (index + 1) % total
    return [
      { sceneIdx: prevIdx, role: "prev" as const },
      { sceneIdx: index, role: "current" as const },
      { sceneIdx: nextIdx, role: "next" as const },
    ]
  }, [index, total])

  // Sort by sceneIdx so React keys stay in stable DOM order.
  // Prevents DOM reordering which resets CSS animations on moved nodes.
  const renderSlots = useMemo(
    () => [...slots].sort((a, b) => a.sceneIdx - b.sceneIdx),
    [slots]
  )

  // ── Carousel motion / styling ─────────────────────────────
  const {
    styleForRole,
    onTransitionEnd } = useCarouselMotion({
      store: { offset, dragging, settling },
      horizontal: axis === "horizontal",
      id,
      axisSize
    })

  return (
    <div
      data-type="carousel"
      ref={carouselRef}
      className='carousel-base'
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      data-id={id}
      data-axis={axis}
      data-lock-prev-at={lockPrevAt ?? ''}
      data-lock-next-at={lockNextAt ?? ''}
    >
      {renderSlots.map((slot) => {
        const Scene = augmentedScenes[slot.sceneIdx]

        return (
          <div
            key={slot.sceneIdx}
            style={styleForRole(slot.role)}
            data-role={slot.role}
            onTransitionEnd={onTransitionEnd}
          >
            <Scene />
          </div>
        )
      })}
    </div>
  )
}