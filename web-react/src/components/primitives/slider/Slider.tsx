import { useRef } from "react"
import { usePointerBridge } from "../../../hooks/usePointerBridge.ts"
import { useSliderSizing } from "./hooks/useSliderSizing.ts"
import { useSliderMotion } from "./hooks/useSliderMotion.ts"
import { useSliderStore } from "./hooks/useSliderStore.ts"
import type { SliderProps } from '@typeScript/propsType.ts'
import { sliderStore } from '../../../stores/sliderStore.ts'

export default function Slider({
  id,
  axis,
  onValueChange,
  className,
  trackStyling,
  thumbStyling,
  children
}: SliderProps) {

  // ── Fully subscribe to the slider store ─────────────────────────────
  const { value, min, max, size, thumbSize, dragging } = useSliderStore(id)

  const horizontal = axis === 'horizontal'
  const axisSize = horizontal ? size.x : size.y
  const axisThumbSize = horizontal ? thumbSize.x : thumbSize.y
  const constraints = { min, max }

  // ── CSS classes ─────────────────────────────
  const classAxisSlider = axis === 'horizontal'
    ? 'horizontal-slider'
    : 'vertical-slider'

  const classAxisTrack = axis === 'horizontal'
    ? 'horizontal-track'
    : 'vertical-track'


  // ── DOM references & sizing ─────────────────────────────
  const sliderRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  useSliderSizing({ elRef: sliderRef, thumbRef: thumbRef, id })

  // ── Track last emitted value to deduplicate ─────────────────────────────
  const lastEmitted = useRef<number | null>(null)

  // ── Pointer forwarding for gestures ─────────────────────────────

  // FUTURE useSliderReaction or useSliderCallback — takes { id, horizontal, min, max, reactPress, reactSwipe, reactSwipeStart, reactSwipeCommit, onValueChange } and returns the onReaction handler to pass to usePointerBridge. Keeps Slider.tsx clean.


  usePointerBridge({
    elRef: sliderRef,
    onReaction: (reaction) => {
      const event = reaction.detail?.event
      if (!event) return

      const shouldReact =
        (event === 'press') ||
        (event === 'swipe') ||
        (event === 'swipeStart') ||
        (event === 'swipeCommit')

      if (!shouldReact) return


      const currentValue = sliderStore.getState().get(id)?.value ?? 0
      let emitValue = Math.round(currentValue)
      if (!horizontal) {
        emitValue = max - (emitValue - min)
      }
      if (emitValue === lastEmitted.current) return
      lastEmitted.current = emitValue
      onValueChange?.(emitValue)
    }
  })

  // ── Slider motion / styling ─────────────────────────────
  const { thumbStyle } = useSliderMotion({
    position: value,
    constraints,
    axisSize,
    axisThumbSize,
    dragging: dragging,
    horizontal
  })

  return (
    <div
      data-type="slider"
      // data-press="true"
      ref={sliderRef}
      className={`slider ${classAxisSlider} ${className ?? ''}`}
      data-id={id}
      data-axis={axis}
    >
      <div
        className={`track ${classAxisTrack} ${trackStyling ?? ''}`}>
      </div>

      <div
        ref={thumbRef}
        className={`slider-thumb ${thumbStyling ?? ''}`}
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