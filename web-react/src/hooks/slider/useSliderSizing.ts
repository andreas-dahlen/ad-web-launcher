import { useEffect, useState } from "react"
import { state } from "@interaction/state/stateManager.ts"

interface UseSliderSizingProps {
    elRef: React.RefObject<HTMLElement>
    thumbRef: React.RefObject<HTMLElement>
    id: string
}

export function useSliderSizing({
    elRef,
    thumbRef,
    id,
}: UseSliderSizingProps) {

    const [laneSize, setLaneSize] = useState({x: 0, y: 0})
    const [thumbSize, setThumbSize] = useState({x: 0, y: 0})

    useEffect(() => {

        const el = elRef.current
        const thumbEl = thumbRef.current

        if (!el || !thumbEl) return

        function updateLaneSize() {

            const trackSize = {
                x: el.offsetWidth,
                y: el.offsetHeight
            }

            const thumbContent = thumbEl.firstElementChild as HTMLElement | null

            const thumbSize = {
                x: thumbContent?.offsetWidth ?? 0,
                y: thumbContent?.offsetHeight ?? 0
            }

            setLaneSize(trackSize)
            setThumbSize(thumbSize)

        state.setSize('slider', id, trackSize)
        state.setThumbSize('slider', id, thumbSize)
        }

        updateLaneSize()

    const observer = new ResizeObserver(updateLaneSize)
    observer.observe(el)
    observer.observe(thumbEl)

    return () => observer.disconnect()

  }, [elRef, thumbRef, id])

  return { laneSize, thumbSize }
}