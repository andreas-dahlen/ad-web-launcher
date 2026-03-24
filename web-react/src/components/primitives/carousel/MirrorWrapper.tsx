import { useRef, useEffect } from "react"
import { useCarouselState } from "@interaction/state/carouselState.ts"
import { useCarouselMotion } from "@carousel/hooks/useCarouselMotion.ts"
import { useCarouselSizing } from "@carousel/hooks/useCarouselSizing.ts"
import type { SceneRole } from "@carousel/hooks/useCarouselScenes.ts"
import { Children } from "react"

interface MirrorCarouselProps {
  id: string
  axis: "horizontal" | "vertical"
  renderLanes: number[]           // which scene indexes you want to render
  className?: string
  children?: React.ReactNode    // content mapped to renderLanes
}

interface Slot {
  sceneIdx: number
  role: SceneRole
}

/** Same helper as Carousel */
function getSwipeDirection(
  oldIdx: number,
  newIdx: number,
  count: number
): "forward" | "backward" {
  return newIdx === (oldIdx + 1) % count ? "forward" : "backward"
}

export default function MirrorCarousel({
  id,
  axis,
  renderLanes,
  className,
  children
}: MirrorCarouselProps) {

  const carouselRef = useRef<HTMLDivElement>(null)

  const lane = useCarouselState.useStore(s => s.lanes[id])
  const index = lane?.index ?? 0
  const total = lane?.count ?? 3

  // same sizing system
  useCarouselSizing({
    elRef: carouselRef,
    axis,
    id
  })

  // ─────────────────────────────────────
  // 🧠 SAME SLOT SYSTEM AS CAROUSEL
  // ─────────────────────────────────────
  const slotsRef = useRef<Slot[] | null>(null)
  const prevIndexRef = useRef(index)
  const mountedRef = useRef(false)

  if (!slotsRef.current) {
    slotsRef.current = [
      { sceneIdx: (index - 1 + total) % total, role: "prev" },
      { sceneIdx: index, role: "current" },
      { sceneIdx: (index + 1) % total, role: "next" }
    ]
    prevIndexRef.current = index
  }

  // rotate slots when index changes
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }

    if (!slotsRef.current) return

    const dir = getSwipeDirection(prevIndexRef.current, index, total)

    const prev = slotsRef.current.find(s => s.role === "prev")!
    const curr = slotsRef.current.find(s => s.role === "current")!
    const next = slotsRef.current.find(s => s.role === "next")!

    if (dir === "forward") {
      prev.role = "next"
      prev.sceneIdx = (index + 1) % total
      curr.role = "prev"
      next.role = "current"
    } else {
      next.role = "prev"
      next.sceneIdx = (index - 1 + total) % total
      curr.role = "next"
      prev.role = "current"
    }

    prevIndexRef.current = index
  }, [index, total])

  const slots = slotsRef.current!

  // ─────────────────────────────────────
  // 🎯 ONLY DIFFERENCE FROM CAROUSEL
  // decide WHAT to render
  // ─────────────────────────────────────
  function renderSlot(sceneIdx: number) {
    if (!children) return null

    const childIdx = renderLanes.indexOf(sceneIdx)
    if (childIdx === -1) return null

    const childArray = Children.toArray(children)
    return childArray[childIdx] ?? null
  }
  //use memo?
  const laneSize = axis === "horizontal" ? lane.size.x : lane.size.y
  // same motion system
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
      ref={carouselRef}
      className={className}
      data-type="mirror-carousel"
      data-id={id}
      data-axis={axis}
      style={{ ...carouselStyle, pointerEvents: "none" }}
    >
      <div
        className="scene-default"
        style={styleForRole(slots[0].role)}
        data-role={slots[0].role}
        onTransitionEnd={onTransitionEnd}
      >
        {renderSlot(slots[0].sceneIdx)}
      </div>

      <div
        className="scene-default"
        style={styleForRole(slots[1].role)}
        data-role={slots[1].role}
        onTransitionEnd={onTransitionEnd}
      >
        {renderSlot(slots[1].sceneIdx)}
      </div>

      <div
        className="scene-default"
        style={styleForRole(slots[2].role)}
        data-role={slots[2].role}
        onTransitionEnd={onTransitionEnd}
      >
        {renderSlot(slots[2].sceneIdx)}
      </div>
    </div>
  )
}