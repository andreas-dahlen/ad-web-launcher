import Drag from '@components/primitives/drag/Drag'
import type { DragFrameProps } from '@typeScript/propsType'
import { useSettingsStore } from '../../hooks/useSettingsStore'

export default function DragFrame({
  id,
  className,
  children,
  dragDataAttrs,
  onSwipeCommit,
}: DragFrameProps) {

  const { isLayoutEditMode, isSnapEnabled } = useSettingsStore()

  return (

    <Drag
      id={`${id}-frame`}
      className={className}
      useSettingsSnap={isSnapEnabled}
      interactive={isLayoutEditMode}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      {children}
    </Drag>
  )

}