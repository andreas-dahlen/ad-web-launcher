import { useRef, useEffect } from "react"
import { state } from "@interaction/state/stateManager"
import { usePointerForwarding } from "@interaction/bridge/bridge.ts"
import { useCarouselState } from "@interaction/state/carouselState.ts"
import { useCarouselMotion } from "@hooks/carousel/useCarouselMotion.ts"
import { useCarouselSizing } from "@hooks/carousel/useCarouselSizing.ts"
import type { SceneRole } from "@hooks/carousel/useCarouselScenes.ts"

interface CarouselProps {
  id: string
  axis: 'horizontal' | 'vertical'
  scenes: React.ComponentType[]
  className?: string
  lockPrevAt?: number
  lockNextAt?: number
  reactSwipeCommit?: boolean
  onSwipeCommit?: (detail: unknown) => void
}

interface Slot {
  sceneIdx: number
  role: SceneRole
}

/** Determine swipe direction from old→new index (single-step wraparound). */
function getSwipeDirection(
  oldIdx: number,
  newIdx: number,
  count: number
): "forward" | "backward" {
  return newIdx === (oldIdx + 1) % count ? "forward" : "backward"
}

export default function Carousel({
  id,
  axis,
  scenes,
  className,
  lockPrevAt,
  lockNextAt,
  onSwipeCommit,
}: CarouselProps) {

  useEffect(() => {
    state.ensure('carousel', id)
  }, [id])

  useEffect(() => {
    state.setCount('carousel', id, scenes.length)
  }, [id, scenes.length])

  const carouselRef = useRef<HTMLDivElement>(null)

  const lane = useCarouselState.useStore(s => s.lanes[id])
  const index = lane?.index ?? 0
  const total = scenes.length

  const laneSize = useCarouselSizing({
    elRef: carouselRef,
    axis,
    id
  })

  usePointerForwarding({
    elRef: carouselRef,
    onReaction: (reaction) => {
      if (reaction.type === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Stable slot management ──────────────────────────────────
  // 3 physical slots, each holds a scene component. On index change
  // roles rotate and only the furthest-away slot swaps its scene,
  // keeping the other two mounted (CSS animations preserved).
  const slotsRef = useRef<Slot[] | null>(null)
  const prevIndexRef = useRef(index)

  if (!slotsRef.current) {
    slotsRef.current = [
      { sceneIdx: (index - 1 + total) % total, role: "prev" as SceneRole },
      { sceneIdx: index,                        role: "current" as SceneRole },
      { sceneIdx: (index + 1) % total,          role: "next" as SceneRole },
    ]
    prevIndexRef.current = index
  }

  if (index !== prevIndexRef.current) {
    const dir = getSwipeDirection(prevIndexRef.current, index, total)

    const prevSlot = slotsRef.current.find(s => s.role === "prev")!
    const currSlot = slotsRef.current.find(s => s.role === "current")!
    const nextSlot = slotsRef.current.find(s => s.role === "next")!

    if (dir === "forward") {
      // prev animated off-screen → recycle as next with the new scene
      prevSlot.role = "next"
      prevSlot.sceneIdx = (index + 1) % total
      currSlot.role = "prev"
      nextSlot.role = "current"
    } else {
      // next animated off-screen → recycle as prev with the new scene
      nextSlot.role = "prev"
      nextSlot.sceneIdx = (index - 1 + total) % total
      currSlot.role = "next"
      prevSlot.role = "current"
    }

    prevIndexRef.current = index
  }

  // Resolve component references — stable for non-recycled slots
  const slots = slotsRef.current
  const Scene0 = scenes[slots[0].sceneIdx]
  const Scene1 = scenes[slots[1].sceneIdx]
  const Scene2 = scenes[slots[2].sceneIdx]

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
      style={carouselStyle}
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