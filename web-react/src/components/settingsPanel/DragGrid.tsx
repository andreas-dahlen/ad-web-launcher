import { useSettingsStore } from '@config/settingsHooks/useSettings'

function snapPositions(count: number) {
  if (!count || count <= 0) return []
  if (count === 1) return [50]
  const step = 100 / (count - 1)
  return Array.from({ length: count }, (_, i) => i * step)
}

export default function DragGrid() {
  const { defaultSnapX, defaultSnapY, gridEnabled } = useSettingsStore()
  if (!gridEnabled) return null

  const xPositions = snapPositions(defaultSnapX)
  const yPositions = snapPositions(defaultSnapY)

  return (
    <div className="drag-grid">
      {xPositions.map(n => (
        <div key={`v-${n}`} className="grid-line vertical" style={{ left: `${n}%` }} />
      ))}
      {yPositions.map(n => (
        <div key={`h-${n}`} className="grid-line horizontal" style={{ top: `${n}%` }} />
      ))}
    </div>
  )
}