import { useRef } from "react"
import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook.ts'
import { useSliderSizing } from './hooks/useSliderSizing.hook.ts'
import { useSliderMotion } from './hooks/useSliderMotion.hook.ts'
import { useSliderStore } from './store/useSliderStore.hook.ts'
import { sliderStore } from './store/slider.store.ts'
import css from './Slider.module.css'
import clsx from 'clsx'
import { dasx } from '../../shared/sxCompiler/dasx.ts'
import { svsx } from '../../shared/sxCompiler/svsx.ts'
import type { SliderPrimProps } from '@primitives/types/prim.types.ts'
import { sliderPreset } from '@generated/presets/slider.preset.ts'
import { cpsx } from '../../shared/sxCompiler/cpsx.ts'
import { sliderStyle } from '@shared/generated/tokenStyles/tokenStyles.ts'
import vars from '@styleCompiler/tokens.module.css'

export default function SliderPrim({
  id,
  axis,
  interactive = true,
  instantSwipe = true,
  isInFlow = true,
  presets,
  children,
  sliderDataAttrs,
  styleVars,
  //TODO add initialValue
  onValueChange
}: SliderPrimProps) {

  // ── Fully subscribe to the slider store ─────────────────────────────
  const { value, constraints, layout, dragging } = useSliderStore(id)

  const isHorizontal = axis === 'horizontal'
  const axisSize = isHorizontal ? layout.containerSize.width : layout.containerSize.height
  const axisitemSize = isHorizontal ? layout.itemSize.width : layout.itemSize.height
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

      const shouldReact = ['press', 'swipe', 'swipeStart', 'swipeCommit'].includes(event)

      if (!shouldReact) return


      const currentValue = sliderStore.getState().get(id)?.value ?? 0
      let emitValue = Math.round(currentValue)
      if (!isHorizontal) {
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
    isHorizontal
  })

  return (
    <div
      className={clsx(css.slider, vars.sliderCompiler, ...cpsx(presets, sliderPreset))}
      style={{
        pointerEvents: interactive ? 'auto' : 'none',
        position: isInFlow ? "relative" : "absolute",
        ...svsx(styleVars ?? {}, sliderStyle)
      }}
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

      <div className={css.track} />

      <div
        className={clsx(css.thumb)}
        style={{
          ...thumbStyle,
          ...(isHorizontal ? { left: 0 } : { top: 0 })
        }}
        ref={thumbRef}
      >
        {children}
      </div>
    </div>
  )
}