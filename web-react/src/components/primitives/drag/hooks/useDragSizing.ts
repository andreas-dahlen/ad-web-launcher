import { useLayoutEffect } from "react"
import { dragStore } from '../../../../stores/dragStore'
import { sizeStore } from '../../../../stores/sizeStore'


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

  useLayoutEffect(() => {
    const el = elRef.current
    const containerEl = containerRef.current
    if (!el || !containerEl) return

    function updateLayout() {
      if (!el || !containerEl) return

      const { scaledHeight, scaledWidth } = sizeStore.getState() //TODO in the future divide by scale from sizeStore?

      const itemWidth = el.offsetWidth
      const itemHeight = el.offsetHeight
      const containerWidth = containerEl.offsetWidth
      const containerHeight = containerEl.offsetHeight

      const deviceSize = {
        width: scaledWidth,
        height: scaledHeight
      }

      const containerSize = {
        width: containerWidth,
        height: containerHeight
      }

      const itemSize = {
        width: itemWidth,
        height: itemHeight
      }

      const constraints = {
        minX: 0,
        minY: 0,
        maxX: containerWidth - itemWidth,
        maxY: containerHeight - itemHeight
      }
      dragStore.getState().setLayout(id, { constraints, containerSize, itemSize, deviceSize })
    }
    updateLayout()

    const observer = new ResizeObserver(updateLayout)
    observer.observe(el)
    observer.observe(containerEl)

    return () => observer.disconnect()

  }, [elRef, containerRef, id])
}
