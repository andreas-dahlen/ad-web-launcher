import { useEffect } from "react"
import { state } from "@interaction/state/stateManager.ts"

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
    // const [laneSize, setLaneSize] = useState(0)

    useEffect(() => {
        const el = elRef.current
        if (!el) return
        function updateLaneSize() {
            if (!el) return

            const trackSize = {
                x: el.offsetWidth,
                y: el.offsetHeight
            }

            // const sizeValue =
            //     axis === "horizontal"
            //         ? el.offsetWidth
            //         : el.offsetHeight

            // setLaneSize(sizeValue)

            state.setSize("carousel", id, trackSize)
        }

        updateLaneSize()

        const observer = new ResizeObserver(updateLaneSize)
        if (el)
            observer.observe(el)

        return () => observer.disconnect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [axis, id])
}