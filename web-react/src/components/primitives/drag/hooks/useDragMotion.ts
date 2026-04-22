import { useMemo } from "react"

interface UseDragMotionProps {
  position: { x?: number; y?: number }
  offset: { x?: number; y?: number }
  dragging: boolean
}

export function useDragMotion({
  position,
  offset,
  dragging
}: UseDragMotionProps) {
  const motionStyle = useMemo(() => {
    const x = (position.x ?? 0) + (offset.x ?? 0)
    const y = (position.y ?? 0) + (offset.y ?? 0)

    return {
      transform: `translate3d(${x}px, ${y}px, 0)`,
      transition: dragging ? "none" : "transform 180ms ease-out"
    }
  }, [position.x, position.y, offset.x, offset.y, dragging])

  return { motionStyle }
}