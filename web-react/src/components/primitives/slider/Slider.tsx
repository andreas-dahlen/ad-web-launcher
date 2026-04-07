import { useRef } from "react"
import { usePointerForwarding } from "@components/hooks/bridge.ts"
import { useSliderSizing } from "./hooks/useSliderSizing.ts"
import { useSliderMotion } from "./hooks/useSliderMotion.ts"
import { useSliderZustand } from "./hooks/useSliderStore.ts"

export interface SliderProps {
  id: string
  axis: 'horizontal' | 'vertical'
  className?: string
  reactSwipe?: boolean
  reactSwipeStart?: boolean
  reactSwipeCommit?: boolean
  onVolumeChange?: (value: number) => void
  trackStyling?: string
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
  trackStyling,
  children
}: SliderProps) {

  // ── Fully subscribe to the slider store ─────────────────────────────
  const { value, min, max, size, thumbSize, dragging } = useSliderZustand(id)

  const horizontal = axis === 'horizontal'
  const axisSize = horizontal ? size.x : size.y
  const axisThumbSize = horizontal ? thumbSize.x : thumbSize.y
  const constraints = { min, max }

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
    position: value,
    constraints,
    axisSize,
    axisThumbSize,
    dragging: dragging ?? false,
    horizontal
  })

  return (
    <div
      data-type="slider"
      data-press="true"
      ref={sliderRef}
      className={horizontal ?
        `default-slider horizontal-slider ${className}`
        : `default-slider vertical-slider ${className}`}
      data-id={id}
      data-axis={axis}
      data-react-swipe={reactSwipe ? true : undefined}
      data-react-swipe-start={reactSwipeStart ? true : undefined}
      data-react-swipe-commit={reactSwipeCommit ? true : undefined}
    >
      <div
        className={horizontal ?
          `default-track horizontal-track ${trackStyling}`
          : `default-track vertical-track ${trackStyling}`}>
      </div>

      <div
        ref={thumbRef}
        className='slider-thumb'
        style={{
          ...thumbStyle,
          ...(horizontal ? { left: 0 } : { top: 0 })
        }}
      >
        {children}
      </div>
    </div>
  )
}