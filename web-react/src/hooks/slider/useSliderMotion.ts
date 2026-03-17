import { useMemo } from "react"

interface UseSliderMotionProps {
  lanePosition: number
  laneConstraints: { min: number; max: number }
  laneSize: number
  laneThumbSize: number
  dragging: boolean
  horizontal: boolean
}

const BASE_STYLE = {
  willChange: "transform" as const
}

export function useSliderMotion({
  lanePosition,
  laneConstraints,
  laneSize,
  laneThumbSize,
  dragging,
  horizontal
}: UseSliderMotionProps) {
  const thumbStyle = useMemo(() => {
    const { min, max } = laneConstraints
    const value = lanePosition

    const range = max - min || 1
    const ratio = (value - min) / range

    // usable space for thumb
    const usable = Math.max(laneSize - laneThumbSize, 0)
    const pos = ratio * usable

    return {
      ...BASE_STYLE,
      transform: horizontal
        ? `translate3d(${pos}px,0,0)`
        : `translate3d(0,${pos}px,0)`,
      transition: dragging ? "none" : "transform 150ms ease-out"
    }
  }, [lanePosition, laneConstraints, laneSize, laneThumbSize, dragging, horizontal])

  return { thumbStyle }
}