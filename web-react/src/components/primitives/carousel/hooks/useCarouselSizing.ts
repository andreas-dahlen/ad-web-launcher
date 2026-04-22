import { useEffect } from "react"
import { carouselStore } from '../../../../stores/carouselStore'

interface UseCarouselSizingProps {
    elRef: React.RefObject<HTMLElement | null>
    axis: "horizontal" | "vertical"
    id: string
}

export function useCarouselSizing({
    elRef,
    axis,
    id
}: UseCarouselSizingProps): void {

    useEffect(() => {
        const el = elRef.current
        if (!el) return
        function updateLaneSize() {
            if (!el) return

            const size = {
                x: el.offsetWidth,
                y: el.offsetHeight
            }

            carouselStore.getState().setSize(id, size)
        }

        updateLaneSize()

        const observer = new ResizeObserver(updateLaneSize)
        if (el)
            observer.observe(el)

        return () => observer.disconnect()
    }, [elRef, axis, id])
}