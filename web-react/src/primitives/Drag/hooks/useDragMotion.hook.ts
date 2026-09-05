import { useMemo } from "react"
import { Z } from '@config/zIndex.config.ts';

interface UseDragMotionProps {
  settledOffset: { x?: number; y?: number }
  liveOffset: { x?: number; y?: number }
  dragging: boolean
}

export function useDragMotion({
  settledOffset,
  liveOffset,
  dragging
}: UseDragMotionProps) {
  const x = (settledOffset.x ?? 0) + (liveOffset.x ?? 0)
  const y = (settledOffset.y ?? 0) + (liveOffset.y ?? 0)
  const motionStyle = useMemo(() => {

    return {
      transform: `translate3d(${x}px, ${y}px, 0)`,
      transition: dragging ? "none" : "transform 180ms ease-out",
      zIndex: dragging ? Z.dragging : Z.content
    }
  }, [x, y, dragging])

  return { motionStyle }
}