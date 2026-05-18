import { useMemo } from "react"
import { Z } from '@config/zIndex';

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
  const x = (position.x ?? 0) + (offset.x ?? 0)
  const y = (position.y ?? 0) + (offset.y ?? 0)
  const motionStyle = useMemo(() => {

    return {
      transform: `translate3d(${x}px, ${y}px, 0)`,
      transition: dragging ? "none" : "transform 180ms ease-out",
      zIndex: dragging ? Z.dragging : Z.content
    }
  }, [x, y, dragging])

  return { motionStyle }
}