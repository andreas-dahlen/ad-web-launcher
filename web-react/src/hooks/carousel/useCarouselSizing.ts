import { useEffect, useState } from "react"
import { state } from "@interaction/state/stateManager.ts"

interface UseCarouselSizingProps {
    elRef: React.RefObject<HTMLElement>
    axis: "horizontal" | "vertical"
    id: string
}

export function useCarouselSizing({
    elRef,
    axis,
    id
}: UseCarouselSizingProps) {

    const [laneSize, setLaneSize] = useState(0)

    useEffect(() => {

        const el = elRef.current
        if (!el) return

        function updateLaneSize() {

            const trackSize = {
                x: el.offsetWidth,
                y: el.offsetHeight
            }

            const sizeValue =
                axis === "horizontal"
                    ? el.offsetWidth
                    : el.offsetHeight

            setLaneSize(sizeValue)

            state.setSize("carousel", id, trackSize)
        }

        updateLaneSize()

        const observer = new ResizeObserver(updateLaneSize)
        observer.observe(el)

        return () => observer.disconnect()

    }, [elRef, axis, id])

    return { laneSize }
}