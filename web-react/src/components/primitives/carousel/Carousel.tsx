import { useRef, useEffect, useMemo } from "react"
import { usePointerForwarding } from "@interaction/bridge/bridge.ts"
import { useCarouselMotion } from "./hooks/useCarouselMotion.ts"
import { useCarouselSizing } from "./hooks/useCarouselSizing.ts"
import { useAugmentedScenes } from "./hooks/useAugmentedScenes.ts"
import type { SceneRole } from "./hooks/useCarouselScenes.ts"
import { useCarouselZustand } from '@components/primitives/carousel/hooks/useCarouselZustand.ts'
import { carouselStore } from '@interaction/zunstand/carouselState.ts'

interface CarouselProps {
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

  // ── Fully subscribe to the carousel state ─────────────────────────────
  const { settling, index, offset, count, dragging, size } = useCarouselZustand(id)

  // ── Initialize count for mirror scenes ─────────────────────────────

  useEffect(() => {
    if (interactive)
      carouselStore.getState().setCount(id, scenes.length)
  }, [id, scenes.length, interactive])

  // ── DOM reference & lane size ─────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null)
  useCarouselSizing({ elRef: carouselRef, axis, id })

  const laneSize = axis === "horizontal" ? size.x : size.y

  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerForwarding({
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
      laneState: { offset, dragging, settling },
      horizontal: axis === "horizontal",
      id,
      laneSize
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