import { useEffect } from "react"
import { dragStore } from '@interaction/zunstand/dragState'

interface UseDragSizingProps {
  elRef: React.RefObject<HTMLElement | null>
  containerRef: React.RefObject<HTMLElement | null>
  id: string
}

export function useDragSizing({
  elRef,
  containerRef,
  id
}: UseDragSizingProps) {

  // const [laneSize, setLaneSize] = useState({ x: 0, y: 0 })
  // const [constraints, setConstraints] = useState(
  //   { minX: 0, minY: 0, maxX: 0, maxY: 0 })

  useEffect(() => {
    const el = elRef.current
    const containerEl = containerRef.current

    if (!el || !containerEl) return

    function updateLaneSize() {
      if (!el || !containerEl) return

      const itemWidth = el.offsetWidth
      const itemHeight = el.offsetHeight
      const containerWidth = containerEl.offsetWidth
      const containerHeight = containerEl.offsetHeight


      const size = {
        x: containerWidth - itemWidth,
        y: containerHeight - itemHeight
      }

      const constraints = {
        minX: 0,
        minY: 0,
        maxX: size.x,
        maxY: size.y
      }

      // setLaneSize(size)
      // setConstraints(constraints)

      // dragStore.getState().setSize(id, size)
      dragStore.getState().setConstraints(id, constraints)
    }
    updateLaneSize()

    const observer = new ResizeObserver(updateLaneSize)
    observer.observe(el)
    observer.observe(containerEl)

    return () => observer.disconnect()

  }, [elRef, containerRef, id])

  // return { laneSize, constraints }
}
