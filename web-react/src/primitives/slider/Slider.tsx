import { useRef } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.hook.ts'
import { useSliderSizing } from './hooks/useSliderSizing.hook.ts'
import { useSliderMotion } from './hooks/useSliderMotion.hook.ts'
import { useSliderStore } from './store/useSliderStore.hook.ts'
import css from './Slider.module.css'
import clsx from 'clsx'
import { dasx } from '../../shared/utils/dataAttrs.ts'
import type { SliderProps } from '@primitives/prim.types.ts'
import { sliderStore } from '@primitives/slider/store/slider.store.ts'

export default function Slider({
  id,
  axis,
  interactive = true,
  instantSwipe = true,
  className,
  trackClassName,
  thumbClassName,
  children,
  sliderDataAttrs,
  //TODO add initialValue
  onValueChange
}: SliderProps) {

  // ── Fully subscribe to the slider store ─────────────────────────────
  const { value, constraints, layout, dragging } = useSliderStore(id)

  const horizontal = axis === 'horizontal'
  const axisSize = horizontal ? layout.containerSize.width : layout.containerSize.height
  const axisitemSize = horizontal ? layout.itemSize.width : layout.itemSize.height
  const { min, max } = constraints

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
    disabled: !interactive,
    onReaction: (reaction) => {
      const event = reaction.detail
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
    axisitemSize,
    dragging: dragging,
    horizontal
  })

  return (
    <div
      className={clsx(css.slider, className)}
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      ref={sliderRef}
      {...dasx({
        id,
        type: "slider",
        axis,
        frame: "slider",
        instantSwipe,
        ...sliderDataAttrs
      })}
    >
      <div
        className={clsx(css.track, trackClassName)}>
      </div>

      <div
        className={clsx(css.thumb, thumbClassName)}
        style={{
          ...thumbStyle,
          ...(horizontal ? { left: 0 } : { top: 0 })
        }}
        ref={thumbRef}
      >
        {children}
      </div>
    </div>
  )
}