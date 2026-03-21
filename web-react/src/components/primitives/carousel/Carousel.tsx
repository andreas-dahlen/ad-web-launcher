import { useRef, useEffect } from "react"
import { state } from "@interaction/state/stateManager.ts"
import { usePointerForwarding } from "@interaction/bridge/bridge.ts"
import { useCarouselState } from "@interaction/state/carouselState.ts"
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
  interactive=true
}: CarouselProps) {

  useEffect(() => {
    state.ensure('carousel', id)
  }, [id])

  useEffect(() => {
    if (interactive)
    state.setCount('carousel', id, scenes.length)
  }, [id, scenes.length, interactive])

  
  const carouselRef = useRef<HTMLDivElement>(null)
  const lane = useCarouselState.useStore(s => s.lanes[id])
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
  // 3 physical slots, each holds a scene component. On index change
  // roles rotate and only the furthest-away slot swaps its scene,
  // keeping the other two mounted (CSS animations preserved).
  const slotsRef = useRef<Slot[] | null>(null)
  const prevIndexRef = useRef(index)

  if (!slotsRef.current) {
    slotsRef.current = [
      { sceneIdx: (index - 1 + total) % total, role: "prev" as SceneRole },
      { sceneIdx: index, role: "current" as SceneRole },
      { sceneIdx: (index + 1) % total, role: "next" as SceneRole },
    ]
    prevIndexRef.current = index
  }

  const mountedRef = useRef(false);
  // Rotate slots when index changes
  useEffect(() => {

    if (!mountedRef.current) {
      mountedRef.current = true;
      return; // skip first effect run
    }

    if (!slotsRef.current) return;

    const dir = getSwipeDirection(prevIndexRef.current, index, total);
    const prevSlot = slotsRef.current.find(s => s.role === "prev")!;
    const currSlot = slotsRef.current.find(s => s.role === "current")!;
    const nextSlot = slotsRef.current.find(s => s.role === "next")!;

    if (dir === "forward") {
      prevSlot.role = "next";
      prevSlot.sceneIdx = (index + 1) % total;
      currSlot.role = "prev";
      nextSlot.role = "current";
    } else {
      nextSlot.role = "prev";
      nextSlot.sceneIdx = (index - 1 + total) % total;
      currSlot.role = "next";
      prevSlot.role = "current";
    }

    prevIndexRef.current = index;
  }, [index, total, id]);

  useEffect(() => {
    if (!slotsRef.current) return;

    const currentScenes = [
      (index - 1 + total) % total,
      index,
      (index + 1) % total
    ];

    state.setCurrentScenes("carousel", id, currentScenes);
  }, [index, id, total]);

  // Resolve component references — stable for non-recycled slots
  const slots = slotsRef.current
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