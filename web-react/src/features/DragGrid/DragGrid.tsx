import { Z } from '@config/zIndex.config.ts'
import css from './DragGrid.module.css'
import clsx from 'clsx'
import { gestureStore } from '../../shared/state/stores/gesture.store.ts'
import { settingsStore } from '@stores/settings.store.ts'

function snapPositions(count: number) {
  if (!count || count <= 0) return []
  return Array.from({ length: count }, (_, i) => (i + 0.5) * 100 / count)
}

export default function DragGrid() {
  const settings = settingsStore(s => s.settings)
  const activeGesture = gestureStore(s => s.activeGesture)

  const shouldRender =
    settings.gridVisible || activeGesture === 'drag'

  if (!shouldRender) return null

  const xPositions = snapPositions(settings.dragSnapX)
  const yPositions = snapPositions(settings.dragSnapY)

  return (
    <div className={css.grid} style={{ zIndex: Z.dragGrid }}>
      {xPositions.map(n => (
        <div key={`v-${n}`} className={clsx(css.line, css.vertical)} style={{ left: `${n}%` }} />
      ))}
      {yPositions.map(n => (
        <div key={`h-${n}`} className={clsx(css.line, css.horizontal)} style={{ top: `${n}%` }} />
      ))}
    </div>
  )
}