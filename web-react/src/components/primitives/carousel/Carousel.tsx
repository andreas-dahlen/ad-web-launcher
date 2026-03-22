import { useRef, useEffect, useMemo } from "react"
import { Store } from "@interaction/state/stateReactAdapter.ts"
import { state } from "@interaction/state/stateManager.ts"
import { usePointerForwarding } from "@interaction/bridge/bridge.ts"
import { useCarouselMotion } from "./hooks/useCarouselMotion.ts"
import { useCarouselSizing } from "./hooks/useCarouselSizing.ts"
import { useAugmentedScenes } from "./hooks/useAugmentedScenes.ts"
import type { SceneRole } from "./hooks/useCarouselScenes.ts"

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

/** Determine swipe direction from old→new index (single-step wraparound). */
// function getSwipeDirection(
//   oldIdx: number,
//   newIdx: number,
//   count: number
// ): "forward" | "backward" {
//   return newIdx === (oldIdx + 1) % count ? "forward" : "backward"
// }

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


  //possibly stop using stateManager and reach for store straight away... or rather... carouselStateFn.ensure(id) idk...
  useEffect(() => {
    state.ensure('carousel', id)
  }, [id])

  useEffect(() => {
    if (interactive)
      state.setCount('carousel', id, scenes.length)
  }, [id, scenes.length, interactive])


  const carouselRef = useRef<HTMLDivElement>(null)
  const lane = Store((state) => state.get('carousel', id)?.data)

  const augmentedScenes = useAugmentedScenes(scenes, interactive, lane?.count)
  const index = lane?.index ?? 0
  const total = augmentedScenes.length

  const laneSize = useCarouselSizing({
    elRef: carouselRef,
    axis,
    id
  })

  usePointerForwarding({
    elRef: carouselRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.type === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Stable slot management ──────────────────────────────────

  const prevIndexRef = useRef(index)

  const slots: Slot[] = useMemo(() => {
    const prevIdx = (index - 1 + total) % total
    const nextIdx = (index + 1) % total
    return [
      { sceneIdx: prevIdx, role: "prev" as const },
      { sceneIdx: index, role: "current" as const },
      { sceneIdx: nextIdx, role: "next" as const },
    ]
  }, [index, total])

  // prevIndexRef.current = index
  useEffect(() => { prevIndexRef.current = index }, [index])

  useEffect(() => {
    state.setCurrentScenes("carousel", id, slots.map(s => s.sceneIdx))
  }, [index, id, total, slots])

  const Scene0 = augmentedScenes[slots[0].sceneIdx]
  const Scene1 = augmentedScenes[slots[1].sceneIdx]
  const Scene2 = augmentedScenes[slots[2].sceneIdx]

  const {
    carouselStyle,
    styleForRole,
    onTransitionEnd
  } = useCarouselMotion({
    laneState: lane ?? { offset: 0, dragging: false, settling: false },
    laneSize,
    horizontal: axis === "horizontal",
    id
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
      <div
        className="scene-default"
        style={styleForRole(slots[0].role)}
        data-role={slots[0].role}
        onTransitionEnd={onTransitionEnd}
      >
        <Scene0 />
      </div>
      <div
        className="scene-default"
        style={styleForRole(slots[1].role)}
        data-role={slots[1].role}
        onTransitionEnd={onTransitionEnd}
      >
        <Scene1 />
      </div>
      <div
        className="scene-default"
        style={styleForRole(slots[2].role)}
        data-role={slots[2].role}
        onTransitionEnd={onTransitionEnd}
      >
        <Scene2 />
      </div>
    </div>
  )
}