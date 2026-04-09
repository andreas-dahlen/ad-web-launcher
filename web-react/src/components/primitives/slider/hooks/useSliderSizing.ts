import { useEffect } from "react"
import { sliderStore } from '@interaction/stores/sliderStore.ts'

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

            const size = {
                x: el.offsetWidth,
                y: el.offsetHeight
            }

            const thumbContent = thumbEl.firstElementChild as HTMLElement | null

            const thumbSize = {
                x: thumbContent?.offsetWidth ?? 0,
                y: thumbContent?.offsetHeight ?? 0
            }

            sliderStore.getState().setSize(id, size)
            sliderStore.getState().setThumbSize(id, thumbSize)
        }

        updateLaneSize()

        const observer = new ResizeObserver(updateLaneSize)
        observer.observe(el)
        observer.observe(thumbEl)

        return () => observer.disconnect()

    }, [elRef, thumbRef, id])
}