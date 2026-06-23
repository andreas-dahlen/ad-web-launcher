import Drag from '../primitives/drag/Drag'
import Button from '../primitives/button/Button'
import type { DragButtonProps } from '@composites/comp.types'
import { settingsStore } from '@stores/settings.store'

export default function DragButton({
  id,
  // useSettingsSnap = false,
  className,
  action,
  children,
  buttonDataAttrs,
  dragDataAttrs,
  onSwipeCommit,
  onPressRelease,
}: DragButtonProps) {

  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  return (

    <Drag
      id={`${id}-drag`}
      useSettingsSnap={snapEnabled}
      interactive={dragEnabled}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      <Button
        id={`${id}-button`}
        interactive={!dragEnabled}
        className={className}
        action={action}
        onPressRelease={onPressRelease}
        buttonDataAttrs={buttonDataAttrs}
      >
        {children}
      </Button>
    </Drag>
  )

}