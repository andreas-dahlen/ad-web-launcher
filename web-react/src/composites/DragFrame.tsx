import Drag from '../primitives/drag/Drag'
import type { DragFrameProps } from '@composites/comp.types'
import { settingsStore } from '@stores/settings.store'

export default function DragFrame({
  id,
  className,
  children,
  dragDataAttrs,
  onSwipeCommit,
}: DragFrameProps) {


  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  return (

    <Drag
      id={`${id}-frame`}
      className={className}
      useSettingsSnap={snapEnabled}
      interactive={dragEnabled}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      {children}
    </Drag>
  )

}