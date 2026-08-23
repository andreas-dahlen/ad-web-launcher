import ButtonPrim from '@primitives/Button/ButtonPrim'
import DragPrim from '@primitives/Drag/DragPrim'
import { createId, generateId } from '@data/generators/idGenerator'
import Label, { type LabelSettings } from '../../blocks/Label/Label'
import Svg, { type IconSettings } from '../../blocks/Svg/Svg'
import type { ButtonSettings, Directive, DragSettings } from '@composites/types/comp.types'
import { useBehaviorState } from '@composites/hooks/useBehaviorState.hook'
type ButtonProps = {
  directive?: Directive
  icon?: IconSettings
  label?: LabelSettings
  button?: ButtonSettings
  drag?: DragSettings
}
export default function Button({
  directive,
  icon,
  label,
  button,
  drag
}: ButtonProps) {

  const { presets, styleVars, onPressRelease } = button ?? {}

  const {
    mode,
    movable,
    isInteractive,
    isDragInteractive,
    isCompInteractive,
    isInFlow
  } = useBehaviorState({ ...directive })

  const id = generateId();
  const buttonId = createId("button", id, label?.msg)
  const dragId = createId("drag", id, label?.msg)


  const Button = (
    <>
      <ButtonPrim
        id={buttonId}
        interactive={isCompInteractive}
        isInFlow={isInFlow}
        presets={presets}
        onPressRelease={onPressRelease}
        styleVars={styleVars}
        buttonDataAttrs={{
          "mode": mode,
          "interactive": isInteractive,
          "state": "released"
        }}
      >
        {icon && <Svg
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
      </ButtonPrim>
    </>
  )

  if (movable) return (
    <DragPrim
      id={dragId}
      useSettingsSnap={drag?.useSettingsSnap}
      interactive={isDragInteractive}
      isInFlow={isInFlow}
      onSwipeCommit={drag?.onSwipeCommit && drag.onSwipeCommit}
      snapX={drag?.useSettingsSnap ? drag?.snapX : undefined}
      snapY={drag?.useSettingsSnap ? drag?.snapY : undefined}
    >
      {Button}
    </DragPrim>
  )
  return Button
}