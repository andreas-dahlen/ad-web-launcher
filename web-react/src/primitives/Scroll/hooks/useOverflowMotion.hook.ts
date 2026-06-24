import { useMemo } from "react"

interface UseDragOverflowProps {
  overflowValue: number
  dragging: boolean
}

export function useOverflowMotion({
  overflowValue,
  dragging,
}: UseDragOverflowProps) {
  const overflowStyle = useMemo(() => {

    return {
      transform: `translate3d(0,${overflowValue}px, 0)`,
      transition: dragging ? "none" : "transform 180ms ease-out",
    }
  }, [overflowValue, dragging])

  return { overflowStyle }
}