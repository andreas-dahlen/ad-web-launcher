import DragPrim from '@primitives/DragPrim/DragPrim'
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

    <DragPrim
      id={`${id}-frame`}
      className={className}
      useSettingsSnap={snapEnabled}
      interactive={dragEnabled}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      {children}
    </DragPrim>
  )

}