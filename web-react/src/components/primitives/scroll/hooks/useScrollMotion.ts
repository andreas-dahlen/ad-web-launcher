import { useMemo } from "react"

interface UseDragMotionProps {
  settledValue: number
  liveValue: number
  dragging: boolean
}

export function useScrollMotion({
  settledValue,
  liveValue,
  dragging
}: UseDragMotionProps) {
  const y = (settledValue ?? 0) + (liveValue ?? 0)
  const contentStyle = useMemo(() => {

    return {
      transform: `translate3d(0,${y}px, 0)`,
      transition: dragging ? "none" : "transform 180ms ease-out",
    }
  }, [y, dragging])

  return { contentStyle }
}