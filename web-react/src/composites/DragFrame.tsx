import Drag from '../primitives/drag/Drag'
import type { DragFrameProps } from '@composites/comp.types'
import { useSettingsStore } from '@hooks/useSettingsStore.hook'

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