import ButtonPrim from '@primitives/ButtonPrim/ButtonPrim'
import DragPrim from '@primitives/DragPrim/DragPrim'
import { createId, generateId } from '@utils/idGenerator'
import clsx from 'clsx'
import css from './Button.module.css'
import Label from '../../blocks/Label/Label'
import SvgIcon from '../../blocks/SvgIcon/SvgIcon'
import type { ButtonSettings, Directive, DragSettings } from '@composites/comp.types'
import { useBehaviorState } from '@composites/hooks/useBehaviorState.hook'
import type { IconSettings, LabelSettings } from '../../blocks/blocks.types'
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

  const { className, styleVars, onPressRelease } = button ?? {}

  const {
    mode,
    movable,
    interactive,
    isDragInteractive,
    isCompInteractive,
    inFlow
  } = useBehaviorState({ ...directive })

  const id = generateId();
  const buttonId = createId("button", id, label?.msg)
  const dragId = createId("drag", id, label?.msg)

  const Button = (
    <>
      <ButtonPrim
        id={buttonId}
        interactive={isCompInteractive}
        className={clsx(className, css.button, !inFlow && "notInFlow")}
        onPressRelease={onPressRelease}
        styleVars={styleVars}
        buttonDataAttrs={{
          "mode": mode,
          "interactive": interactive,
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
      </ButtonPrim>
    </>
  )

  if (movable) return (
    <DragPrim
      id={dragId}
      useSettingsSnap={drag?.useSettingsSnap}
      interactive={isDragInteractive}
      onSwipeCommit={drag?.onSwipeCommit && drag.onSwipeCommit}
      className={clsx(inFlow && "isInFlow")}
      snapX={drag?.useSettingsSnap ? drag?.snapX : undefined}
      snapY={drag?.useSettingsSnap ? drag?.snapY : undefined}
    >
      {Button}
    </DragPrim>
  )
  return Button
}