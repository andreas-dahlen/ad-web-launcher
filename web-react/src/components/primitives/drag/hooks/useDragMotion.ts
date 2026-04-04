import { useMemo } from "react"

interface UseDragMotionProps {
  lanePosition: { x?: number; y?: number }
  offset: { x?: number; y?: number }
  dragging: boolean
}

export function useDragMotion({
  lanePosition,
  offset,
  dragging
}: UseDragMotionProps) {
  const itemStyle = useMemo(() => {
    const x = (lanePosition.x ?? 0) + (offset.x ?? 0)
    const y = (lanePosition.y ?? 0) + (offset.y ?? 0)

    return {
      transform: `translate3d(${x}px, ${y}px, 0)`,
      transition: dragging ? "none" : "transform 180ms ease-out"
    }
  }, [lanePosition.x, lanePosition.y, offset.x, offset.y, dragging])

  return { itemStyle }
}