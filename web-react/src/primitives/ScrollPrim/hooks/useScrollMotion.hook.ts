import { useMemo } from "react"

interface UseDragMotionProps {
  liveValue: number
  dragging: boolean
}

export function useScrollMotion({
  liveValue,
  dragging
}: UseDragMotionProps) {
  const contentStyle = useMemo(() => {

    return {
      transform: `translate3d(0,${-liveValue}px, 0)`,
      transition: dragging ? "none" : "transform 180ms ease-out",
    }
  }, [liveValue, dragging])

  return { contentStyle }
}