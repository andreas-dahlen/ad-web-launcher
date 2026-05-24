import Drag from '@components/primitives/drag/Drag'
import Button from '@components/primitives/button/Button'
import type { DragButtonProps } from '@typeScript/propsType'
import { useSettingsStore } from '../../hooks/useSettingsStore'

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