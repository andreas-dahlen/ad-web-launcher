import { useEffect } from "react"
import { sliderStore } from '@interaction/stores/sliderState'

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

    // const [laneSize, setLaneSize] = useState({ x: 0, y: 0 })
    // const [thumbSize, setThumbSize] = useState({ x: 0, y: 0 })

    useEffect(() => {

        const el = elRef.current
        const thumbEl = thumbRef.current

        if (!el || !thumbEl) return

        function updateLaneSize() {
            if (!el || !thumbEl) return

            const trackSize = {
                x: el.offsetWidth,
                y: el.offsetHeight
            }

            const thumbContent = thumbEl.firstElementChild as HTMLElement | null

            const thumbSize = {
                x: thumbContent?.offsetWidth ?? 0,
                y: thumbContent?.offsetHeight ?? 0
            }

            // setLaneSize(trackSize)
            // setThumbSize(thumbSize)

            sliderStore.getState().setSize(id, trackSize)
            sliderStore.getState().setThumbSize(id, thumbSize)
        }

        updateLaneSize()

        const observer = new ResizeObserver(updateLaneSize)
        observer.observe(el)
        observer.observe(thumbEl)

        return () => observer.disconnect()

    }, [elRef, thumbRef, id])

    // return { laneSize, thumbSize }
}