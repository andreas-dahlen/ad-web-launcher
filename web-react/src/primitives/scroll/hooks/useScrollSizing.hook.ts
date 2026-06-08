import { useLayoutEffect } from "react"
import { scrollStore } from '../store/scroll.store'


interface UseScrollSizingProps {
  contentRef: React.RefObject<HTMLElement | null>
  containerRef: React.RefObject<HTMLElement | null>
  id: string
}

export function useScrollSizing({
  contentRef,
  containerRef,
  id
}: UseScrollSizingProps) {

  useLayoutEffect(() => {
    const el = contentRef.current
    const containerEl = containerRef.current
    if (!el || !containerEl) return

    function updateLayout() {
      if (!el || !containerEl) return

      const contentWidth = el.offsetWidth
      const contentHeight = el.offsetHeight
      const containerWidth = containerEl.offsetWidth
      const containerHeight = containerEl.offsetHeight

      const containerSize = {
        width: containerWidth,
        height: containerHeight
      }

      const itemSize = {
        width: contentWidth,
        height: contentHeight
      }

      scrollStore.getState().setLayout(id, { containerSize, itemSize })
    }
    updateLayout()

    const observer = new ResizeObserver(updateLayout)
    observer.observe(el)
    observer.observe(containerEl)

    return () => observer.disconnect()

  }, [contentRef, containerRef, id])
}
