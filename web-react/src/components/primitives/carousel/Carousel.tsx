import { useRef, useEffect, useMemo } from "react"
import { carouselStateFn } from "@interaction/state/carouselState.ts"
import { usePointerForwarding } from "@interaction/bridge/bridge.ts"
import { useCarouselMotion } from "./hooks/useCarouselMotion.ts"
import { useCarouselSizing } from "./hooks/useCarouselSizing.ts"
import { useAugmentedScenes } from "./hooks/useAugmentedScenes.ts"
import type { SceneRole } from "./hooks/useCarouselScenes.ts"
import { subscribe } from "@interaction/state/zustandHook.ts"

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
  className,
  lockPrevAt,
  lockNextAt,
  onSwipeCommit,
  interactive = true
}: CarouselProps) {

  // ── Fully subscribe to the carousel state ─────────────────────────────
  const lane = subscribe.useFull('carousel', id) as CarouselState

  // ── Initialize count for mirror scenes ─────────────────────────────
  useEffect(() => {
    if (interactive)
      carouselStateFn.setCount(id, scenes.length)
  }, [id, scenes.length, interactive])

  // ── DOM reference & lane size ─────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null)
  useCarouselSizing({ elRef: carouselRef, axis, id })

  const laneSize = axis === "horizontal" ? lane.size.x : lane.size.y


  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerForwarding({
    elRef: carouselRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.type === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Augmented scenes & stable slot management ─────────────────────────────
  const augmentedScenes = useAugmentedScenes(scenes, interactive, lane.count)
  const index = lane?.index ?? 0
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

  useEffect(() => {
    carouselStateFn.setCurrentScenes(id, slots.map(s => s.sceneIdx))
  }, [id, slots])

  // ── Carousel motion / styling ─────────────────────────────
  const {
    carouselStyle,
    styleForRole,
    onTransitionEnd } = useCarouselMotion({
      laneState: lane,
      horizontal: axis === "horizontal",
      id,
      laneSize
    })

  return (
    <div
      data-type="carousel"
      ref={carouselRef}
      style={{ ...carouselStyle, pointerEvents: interactive ? "auto" : "none" }}
      data-id={id}
      data-axis={axis}
      data-lock-prev-at={lockPrevAt ?? ''}
      data-lock-next-at={lockNextAt ?? ''}
      className={className}
    >
      {renderSlots.map((slot) => {
        const Scene = augmentedScenes[slot.sceneIdx]

        return (
          <div
            key={slot.sceneIdx}
            className="scene-default"
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