import { useEffect } from "react"
import { carouselStore } from '../store/carousel.store'

interface UseCarouselSizingProps {
    elRef: React.RefObject<HTMLElement | null>

    sceneRef: React.RefObject<HTMLElement | null>
    id: string
}

export function useCarouselSizing({
    elRef,
    sceneRef,
    id
}: UseCarouselSizingProps): void {

    useEffect(() => {
        const el = elRef.current
        if (!el) return
        const scene = sceneRef.current
        function updateLaneSize() {
            if (!el || !scene) return

            const containerSize = {
                width: el.offsetWidth,
                height: el.offsetHeight
            }
            const itemSize = {
                width: scene.offsetWidth,
                height: scene.offsetHeight
            }

            carouselStore.getState().setLayout(id, { containerSize, itemSize })
        }

        updateLaneSize()

        const observer = new ResizeObserver(updateLaneSize)
        if (el) observer.observe(el)
        if (scene) observer.observe(scene)

        return () => observer.disconnect()
    }, [elRef, sceneRef, id])
}