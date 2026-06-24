import { useEffect } from "react"
import { sliderStore } from '@primitives/Slider/store/slider.store'

interface UseSliderSizingProps {
  elRef: React.RefObject<HTMLElement | null>
  thumbRef: React.RefObject<HTMLElement | null>
  id: string
}

export function useSliderSizing({
  elRef,
  thumbRef,
  id,
}: UseSliderSizingProps) {

  useEffect(() => {

    const el = elRef.current
    const thumbEl = thumbRef.current

    if (!el || !thumbEl) return

    function updateLaneSize() {
      if (!el || !thumbEl) return

      const containerSize = {
        width: el.offsetWidth,
        height: el.offsetHeight
      }

      const itemSize = {
        width: thumbEl.offsetWidth,
        height: thumbEl.offsetHeight
      }

      sliderStore.getState().setLayout(id, { containerSize, itemSize })
    }

    updateLaneSize()

    const observer = new ResizeObserver(updateLaneSize)
    observer.observe(el)
    observer.observe(thumbEl)

    return () => observer.disconnect()

  }, [elRef, thumbRef, id])
}