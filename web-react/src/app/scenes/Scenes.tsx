import SceneLayoutPanel from '../../panels/SceneLayoutPanel/SceneLayoutPanel'
import { settingsStore } from '@stores/settings.store'

import clsx from 'clsx'
import type { Axis1D } from '../../shared/types/core.types'
export function Scenes({
  axis,
}: { axis: Axis1D }) {

  const layoutManagerV = settingsStore(s => s.settings.layoutManagerV)
  const layoutManagerH = settingsStore(s => s.settings.layoutManagerH)
  const layoutMode = settingsStore(s => s.settings.layoutMode)

  const showOverlay =
    (axis === "vertical" && layoutManagerV) ||
    (axis === "horizontal" && layoutManagerH)

  return (
    <div>
      <div className={clsx(axis === "horizontal" && "spin-box")}></div>
      {showOverlay && layoutMode === "lanes" && <SceneLayoutPanel />}
    </div>
  )
}