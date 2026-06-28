import type { ButtonProps } from '@composites/comp.types'
import ButtonPrim from '@primitives/ButtonPrim/ButtonPrim'
import DragPrim from '@primitives/DragPrim/DragPrim'
import { settingsStore } from '@stores/settings.store'
import { createId } from '@utils/idGenerator'
import ButtonLabel from './ButtonLabel'
import ButtonIcon from './ButtonIcon'
import clsx from 'clsx'

export default function Button({
  // useSettingsSnap = false,
  className,
  layoutClass,
  dataAttrs,

  interactive = true,
  isMovable = false,

  label,
  labelSide,
  Icon,

  isActive,
  // action, //later integration for Android usage...
  onSwipeCommit,
  onPressRelease
}: ButtonProps) {

  const id = createId()

  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  const componentId = label ? `${label.toLowerCase()}_${id}` : `item_${id}`;

  const dragId = `drag_${componentId}`;
  const buttonId = `button_${componentId}`;

  const isDragOn = dragEnabled && interactive && isMovable

  return (
    <DragPrim
      id={dragId}
      useSettingsSnap={snapEnabled}
      interactive={isDragOn}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dataAttrs}
      className={clsx(!isDragOn && layoutClass)}
    >
      <ButtonPrim
        id={buttonId}
        interactive={(!dragEnabled || !isMovable) && interactive}
        className={className}
        onPressRelease={onPressRelease}
        buttonDataAttrs={{
          ...dataAttrs,
          "active": isActive,
          "interactive": interactive,
          "state": "released"
        }}
      >
        {/* The new isolated icon component handles the rest */}
        {Icon && <ButtonIcon Icon={Icon} isActive={isActive} />}

      </ButtonPrim>

      {label && <ButtonLabel
        msg={label}
        position={labelSide}
      />}
    </DragPrim>
  )
}