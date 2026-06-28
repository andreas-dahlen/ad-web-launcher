import { useEffect } from "react"
import { carouselStore } from '../store/carousel.store'

interface UseItemSizingProps {
  itemRef: React.RefObject<HTMLElement | null>
  id: string
}

export function useItemSizing({
  itemRef,
  id
}: UseItemSizingProps): void {

  useEffect(() => {
    const item = itemRef.current
    function updateSize() {
      if (!item) return

      const itemSize = {
        width: item.offsetWidth,
        height: item.offsetHeight
      }

      carouselStore.getState().setItemSize(id, itemSize)
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    if (item) observer.observe(item)

    return () => observer.disconnect()
  }, [itemRef, id])
}