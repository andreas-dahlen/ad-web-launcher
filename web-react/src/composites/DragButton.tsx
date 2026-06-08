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

  const { isLayoutEditMode, isSnapEnabled } = useSettingsStore()

  return (

    <Drag
      id={`${id}-drag`}
      useSettingsSnap={isSnapEnabled}
      interactive={isLayoutEditMode}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      <Button
        id={`${id}-button`}
        interactive={!isLayoutEditMode}
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