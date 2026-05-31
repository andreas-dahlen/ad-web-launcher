import { useGestureStore } from '@hooks/useGestureStore'
import { useSettingsStore } from '@hooks/useSettingsStore'
import { Z } from '@config/zIndex'
import DragGridCss from './DragGrid.module.css'
import clsx from 'clsx'

function snapPositions(count: number) {
  if (!count || count <= 0) return []
  return Array.from({ length: count }, (_, i) => (i + 0.5) * 100 / count)
}

export default function DragGrid() {
  const { dragSnapX, dragSnapY, isGridEnabled } = useSettingsStore()

  const { activeGesture } = useGestureStore()

  const shouldRender =
    isGridEnabled || activeGesture === 'drag'

  if (!shouldRender) return null

  const xPositions = snapPositions(dragSnapX)
  const yPositions = snapPositions(dragSnapY)

  return (
    <div className={DragGridCss.grid} style={{ zIndex: Z.dragGrid }}>
      {xPositions.map(n => (
        <div key={`v-${n}`} className={clsx(DragGridCss.line, DragGridCss.vertical)} style={{ left: `${n}%` }} />
      ))}
      {yPositions.map(n => (
        <div key={`h-${n}`} className={clsx(DragGridCss.line, DragGridCss.horizontal)} style={{ top: `${n}%` }} />
      ))}
    </div>
  )
}