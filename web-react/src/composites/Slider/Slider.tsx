import type { ButtonProps } from '@composites/Button/Button.types'
import ButtonPrim from '@primitives/ButtonPrim/ButtonPrim'
import DragPrim from '@primitives/DragPrim/DragPrim'
import { settingsStore } from '@stores/settings.store'
import { createId } from '@utils/idGenerator'
import ButtonLabel from './SliderLabel'
import SliderIcon from './SliderIcon'
import clsx from 'clsx'
import css from './Slider.module.css'

export default function Button({
  mode,
  icon,
  label,
  button,
  drag
}: ButtonProps) {

  const {
    movable = false,
    inFlow = true,
    className,
    styleVars,
    onPressRelease
  } = button ?? {}

  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  const id = createId();

  const componentId = label ? `${label.msg.toLowerCase()}_${id}` : `item_${id}`;

  const dragId = `drag_${componentId}`;
  const buttonId = `button_${componentId}`;

  const resolvedMode =
    mode === true ? "on" :
      mode === false ? "off" :
        mode === undefined ? "default" :
          mode

  const interactive = resolvedMode !== "disabled"

  const isDragOn = dragEnabled && interactive && movable
  const buttonNotInFlow = !movable && !inFlow

  const Button = (
    <>
      <ButtonPrim
        id={buttonId}
        // interactive={(!dragEnabled || !isMovable) && interactive}
        interactive={(!dragEnabled || !movable) && interactive}
        className={clsx(className, buttonNotInFlow && css.notInFlow)}
        onPressRelease={onPressRelease}
        styleVars={styleVars}
        buttonDataAttrs={{
          "mode": resolvedMode,
          "interactive": interactive,
          "state": "released"
        }}
      >
        {/* The new isolated icon component handles the rest */}
        {icon && <ButtonIcon
          Svg={icon.Svg}
          mode={resolvedMode}
          {...icon.settings}
        />}

        {label && <ButtonLabel
          msg={label.msg}
          mode={resolvedMode}
          {...label.settings}
        />}
      </ButtonPrim>
    </>
  )

  if (movable) return (
    <DragPrim
      id={dragId}
      useSettingsSnap={snapEnabled}
      interactive={isDragOn}
      onSwipeCommit={drag?.onSwipeCommit && drag.onSwipeCommit}
      className={clsx(inFlow && css.isInFlow)}
    >
      {Button}
    </DragPrim>
  )
  return Button
}