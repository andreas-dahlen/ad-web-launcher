import { useRef } from "react"
import { usePointerForwarding } from "@interaction/bridge/bridge.ts"
import { useSliderSizing } from "./hooks/useSliderSizing.ts"
import { useSliderMotion } from "./hooks/useSliderMotion.ts"
import { useSliderZustand } from "./hooks/useSliderZustand.ts"

interface SliderProps {
  id: string
  axis: 'horizontal' | 'vertical'
  className?: string
  reactSwipe?: boolean
  reactSwipeStart?: boolean
  reactSwipeCommit?: boolean
  onVolumeChange?: (value: number) => void
  trackContent?: React.ReactNode
  children?: React.ReactNode
}

export default function Slider({
  id,
  axis,
  className,
  reactSwipe = false,
  reactSwipeStart = false,
  reactSwipeCommit = false,
  onVolumeChange,
  trackContent,
  children
}: SliderProps) {

  // ── Fully subscribe to the slider state ─────────────────────────────
  const { value, min, max, size, thumbSize, dragging } = useSliderZustand(id)

  const horizontal = axis === 'horizontal'
  const laneSize = horizontal ? size.x : size.y
  const laneThumbSize = horizontal ? thumbSize.x : thumbSize.y
  const laneConstraints = { min, max }

  // ── DOM references & sizing ─────────────────────────────
  const sliderRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  useSliderSizing({ elRef: sliderRef, thumbRef: thumbRef, id })

  // ── Track last emitted value to deduplicate ─────────────────────────────
  const lastEmitted = useRef<number | null>(null)

  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerForwarding({
    elRef: sliderRef,
    onReaction: (reaction) => {
      const event = reaction.detail?.event
      if (!event) return

      const shouldReact =
        (event === 'swipe' && reactSwipe) ||
        (event === 'swipeStart' && reactSwipeStart) ||
        (event === 'swipeCommit' && reactSwipeCommit)

      if (!shouldReact) return

      let emitValue = Math.round(value)
      if (!horizontal) {
        emitValue = max - (emitValue - min)
      }
      if (emitValue === lastEmitted.current) return
      lastEmitted.current = emitValue
      onVolumeChange?.(emitValue)
    }
  })

  // ── Slider motion / styling ─────────────────────────────
  const { thumbStyle } = useSliderMotion({
    lanePosition: value,
    laneConstraints,
    laneSize,
    laneThumbSize,
    dragging: dragging ?? false,
    horizontal
  })

  return (
    <div
      data-type="slider"
      data-press="true"
      ref={sliderRef}
      className={className}
      style={{
        position: "relative",
        pointerEvents: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
      data-id={id}
      data-axis={axis}
      data-react-swipe={reactSwipe ? true : undefined}
      data-react-swipe-start={reactSwipeStart ? true : undefined}
      data-react-swipe-commit={reactSwipeCommit ? true : undefined}
    >
      <div style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        {trackContent}
      </div>

      <div
        ref={thumbRef}
        style={{
          ...thumbStyle,
          position: "absolute",
          ...(horizontal ? { left: 0 } : { top: 0 })
        }}
      >
        {children}
      </div>
    </div>
  )
}