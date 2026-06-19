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

  const { settings } = useSettingsStore()

  return (

    <Drag
      id={`${id}-frame`}
      className={className}
      useSettingsSnap={settings.snapEnabled}
      interactive={settings.dragEnabled}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      {children}
    </Drag>
  )

}