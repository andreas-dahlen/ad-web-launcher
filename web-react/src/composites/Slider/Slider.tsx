import DragPrim from '@primitives/Drag/DragPrim.tsx'
import { createId, generateId } from '@data/generators/idGenerator.ts'
import SliderPrim from '@primitives/Slider/SliderPrim.tsx'
import Label, { type LabelSettings } from '../../blocks/Label/Label.tsx'
import SvgIcon, { type IconSettings } from '../../blocks/Svg/Svg.tsx'
import { useBehaviorState } from '@composites/hooks/useBehaviorState.hook.ts'
import type { Directive, DragSettings, SliderSettings } from '@composites/types/comp.types.ts'

type SliderProps = {
  directive?: Directive
  icon?: IconSettings
  label?: LabelSettings
  slider: SliderSettings
  drag?: DragSettings
}
export default function Slider({
  directive,
  icon,
  label,
  slider,
  drag
}: SliderProps) {

  const { presets, styleVars, onValueChange, axis } = slider ?? {}

  const {
    mode,
    movable,
    isInteractive,
    isDragInteractive,
    isCompInteractive,
    isInFlow
  } = useBehaviorState({ ...directive })

  const id = generateId();
  const sliderId = createId("button", id, label?.msg)
  const dragId = createId("drag", id, label?.msg)

  const Slider = (
    <>
      <SliderPrim
        id={sliderId}
        axis={axis}
        interactive={isCompInteractive}
        isInFlow={isInFlow}
        presets={presets}
        onValueChange={onValueChange}
        styleVars={styleVars}
        sliderDataAttrs={{
          "mode": mode,
          "interactive": isInteractive,
          "state": "released"
        }}
      >
        {icon && <SvgIcon
          Svg={icon.Svg}
          mode={mode}
          variant={icon.variant}
          styleVars={icon.styleVars}
        />}

        {label && <Label
          msg={label.msg}
          mode={mode}
          position={label.position}
        />}
      </SliderPrim>
    </>
  )

  if (movable) return (
    <DragPrim
      id={dragId}
      useSettingsSnap={drag?.useSettingsSnap}
      interactive={isDragInteractive}
      onSwipeCommit={drag?.onSwipeCommit}
      snapX={drag?.useSettingsSnap ? drag?.snapX : undefined}
      snapY={drag?.useSettingsSnap ? drag?.snapY : undefined}
    >
      {Slider}
    </DragPrim>
  )
  return Slider
}