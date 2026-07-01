import type { ButtonProps } from '@composites/Button/Button.types'
import ButtonPrim from '@primitives/ButtonPrim/ButtonPrim'
import DragPrim from '@primitives/DragPrim/DragPrim'
import { settingsStore } from '@stores/settings.store'
import { createId } from '@utils/idGenerator'
import ButtonLabel from './ButtonLabel'
import ButtonIcon from './ButtonIcon'
import clsx from 'clsx'
import css from './Button.module.css'

export default function Button({
  // useSettingsSnap = false,
  className,
  dataAttrs,

  // interactive = true,
  isMovable = false,
  isInFlow = true,
  mode,

  Icon,
  label,

  iconSettings,
  labelSettings,

  // action, //later integration for Android usage...
  onSwipeCommit,
  onPressRelease
}: ButtonProps) {
  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  const id = createId();

  const componentId = label ? `${label.toLowerCase()}_${id}` : `item_${id}`;

  const dragId = `drag_${componentId}`;
  const buttonId = `button_${componentId}`;

  const resolvedMode =
    mode === true ? "on" :
      mode === false ? "off" :
        mode === undefined ? "default" :
          mode

  const interactive = resolvedMode !== "disabled"

  const isDragOn = dragEnabled && interactive && isMovable
  const buttonNotInFlow = !isMovable && !isInFlow

  const button = (
    <>
      <ButtonPrim
        id={buttonId}
        // interactive={(!dragEnabled || !isMovable) && interactive}
        interactive={(!dragEnabled || !isMovable) && interactive}
        className={clsx(className, buttonNotInFlow && css.notInFlow)}
        onPressRelease={onPressRelease}
        buttonDataAttrs={{
          ...dataAttrs,
          "mode": resolvedMode,
          "interactive": interactive,
          "state": "released"
        }}
      >
        {/* The new isolated icon component handles the rest */}
        {Icon && <ButtonIcon
          Icon={Icon}
          mode={resolvedMode}
          {...iconSettings}
        />}

        {label && <ButtonLabel
          label={label}
          mode={resolvedMode}
          {...labelSettings}
        />}
      </ButtonPrim>
    </>
  )

  if (isMovable) return (
    <DragPrim
      id={dragId}
      useSettingsSnap={snapEnabled}
      interactive={isDragOn}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dataAttrs}
      className={clsx(isInFlow && css.isInFlow)}
    >
      {button}
    </DragPrim>
  )
  return button
}