import { useEffect } from "react"
import { carouselStore } from '../store/carousel.store'

interface UseCarouselSizingProps {
  elRef: React.RefObject<HTMLElement | null>
  id: string
}

export function useContainerSizing({
  elRef,
  id
}: UseCarouselSizingProps): void {

  useEffect(() => {
    const el = elRef.current
    function updateSize() {
      if (!el) return

      const containerSize = {
        width: el.offsetWidth,
        height: el.offsetHeight
      }

      carouselStore.getState().setContainerSize(id, containerSize)
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    if (el) observer.observe(el)

    return () => observer.disconnect()
  }, [elRef, id])
}