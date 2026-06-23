import type { Scene } from '@app/compositions/layout.store'
import SceneLayoutOverlay from '@app/scenes/SceneLayoutOverlay'
import { settingsStore } from '@stores/settings.store'
import type { Axis1D } from '@typing/core.types'
import clsx from 'clsx'
export function Scenes({
  scene,
  laneId,
  sceneIdx,
  axis
}: { scene: Scene, laneId: string, sceneIdx: number, axis: Axis1D }) {

  const layoutManagerV = settingsStore(s => s.settings.layoutManagerV)
  const layoutManagerH = settingsStore(s => s.settings.layoutManagerH)

  const showOverlay =
    (axis === "vertical" && layoutManagerV) ||
    (axis === "horizontal" && layoutManagerH)

  return (
    <div key={scene.sceneId}>
      <div className={clsx(axis === "horizontal" && "spin-box")}></div>
      {showOverlay && <SceneLayoutOverlay
        scene={scene}
        sceneIdx={sceneIdx}
        laneId={laneId}
        axis={axis}
      />}
    </div>
  )
}