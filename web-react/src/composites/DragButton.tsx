import Drag from '../primitives/drag/Drag'
import Button from '../primitives/button/Button'
import type { DragButtonProps } from '@composites/comp.types'
import { useSettingsStore } from '@hooks/useSettingsStore.hook'

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

  const { settings } = useSettingsStore()

  return (

    <Drag
      id={`${id}-drag`}
      useSettingsSnap={settings.snapEnabled}
      interactive={settings.dragEnabled}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      <Button
        id={`${id}-button`}
        interactive={!settings.dragEnabled}
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