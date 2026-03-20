import { useRef } from "react"
import { useCarouselState } from "@interaction/state/carouselState.ts"
import { useCarouselSizing } from "@carousel/hooks/useCarouselSizing.ts"
import { useCarouselMotion } from "@carousel/hooks/useCarouselMotion.ts"

interface MirrorProps {
  id: string
  index: number
  axis: "horizontal" | "vertical"
  className?: string
  children?: React.ReactNode
}

export default function CarouselMirrorAtIndex({
  id,
  index,
  axis,
  className,
  children
}: MirrorProps) {

  const ref = useRef<HTMLDivElement>(null)

  const lane = useCarouselState.useStore(s => s.lanes[id])

  const laneSize = useCarouselSizing({
    elRef: ref,
    axis,
    id
  })

  const { carouselStyle, styleForRole } = useCarouselMotion({
    laneState: lane ?? { offset: 0, dragging: false, settling: false },
    laneSize,
    horizontal: axis === "horizontal",
    id
  })

  if (!lane) return null

  const total = lane.count || 1

  const role =
    index === lane.index
      ? "current"
      : index === (lane.index - 1 + total) % total
      ? "prev"
      : index === (lane.index + 1) % total
      ? "next"
      : null

  // Not in visible range → don’t render
  if (!role) return null

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...carouselStyle, pointerEvents: "none" }}
    >
      <div
        className="scene-default"
        style={styleForRole(role)}
        data-role={role}
      >
        {children}
      </div>
    </div>
  )
}