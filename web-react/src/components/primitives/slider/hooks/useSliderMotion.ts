import { useMemo } from "react"

interface UseSliderMotionProps {
  position: number
  constraints: { min: number; max: number }
  axisSize: number
  axisThumbSize: number
  dragging: boolean
  horizontal: boolean
}

// const BASE_STYLE = {
//   willChange: "transform" as const
// }

export function useSliderMotion({
  position,
  constraints,
  axisSize,
  axisThumbSize,
  dragging,
  horizontal
}: UseSliderMotionProps) {
  const thumbStyle = useMemo(() => {
    const { min, max } = constraints
    const value = position

    const range = max - min || 1
    const ratio = (value - min) / range

    // usable space for thumb
    const usable = Math.max(axisSize - axisThumbSize, 0)
    const pos = ratio * usable

    return {
      transform: horizontal
        ? `translate3d(${pos}px,0,0)`
        : `translate3d(0,${pos}px,0)`,
      transition: dragging ? "none" : "transform 150ms ease-out"
    }
  }, [position, constraints, axisSize, axisThumbSize, dragging, horizontal])

  return { thumbStyle }
}