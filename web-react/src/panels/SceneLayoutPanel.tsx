import clsx from 'clsx';
import css from './Scenes.module.css'
import Button from '@primitives/Button/Button';
import { layoutStore, type Scene } from '@stores/layout.store';
import type { Axis1D } from '@typing/core.types';
import { PanelBase } from '@composites/controls/PanelBase/PanelBase';

export default function SceneLayoutPanel({
  scene,
  sceneIdx,
  laneId,
  axis

}: { scene: Scene, sceneIdx: number, laneId: string, axis: Axis1D }) {
  const addLane = layoutStore.getState().addLane
  const deleteLane = layoutStore.getState().deleteLane
  const moveLane = layoutStore.getState().moveLane

  const addScene = layoutStore.getState().addScene
  const deleteScene = layoutStore.getState().deleteScene
  const moveScene = layoutStore.getState().moveScene

  const horizontal = axis === "horizontal"
  return (
    <>
      <PanelBase>
        <p>current: {sceneIdx}</p>
        <div className={clsx(horizontal && css.vertical, !horizontal && css.vertical)}>
          <div className={clsx(css.buttonrow, horizontal && css.horizontal, !horizontal && css.vertical)}>
            <Button
              id="add-lane"
              onPressRelease={() => addLane(axis)}
            >
              add Lane
            </Button>
            <Button
              id="delete-lane"
              onPressRelease={() => deleteLane(axis, laneId)}
            >
              delete Lane
            </Button>
            <Button
              id="move-prev-lane"
              onPressRelease={() => moveLane(axis, laneId, -1)}
            >
              reduce Lane
            </Button>
            <Button
              id="move-more-lane"
              onPressRelease={() => moveLane(axis, laneId, +1)}
            >
              reduce Lane
            </Button>
          </div>
          <div className={clsx(css.buttonrow, horizontal && css.horizontal, !horizontal && css.vertical)}>
            <Button
              id="add-scene"
              onPressRelease={() => addScene(axis, laneId)}
            >
              add scene
            </Button>
            <Button
              id="delete-scene"
              onPressRelease={() => deleteScene(axis, laneId, scene.sceneId)}
            >
              delete scene
            </Button>
            <Button
              id="move-prev-scene"
              onPressRelease={() => moveScene(axis, laneId, scene.sceneId, -1)}
            >
              reduce scene
            </Button>
            <Button
              id="move-more-scene"
              onPressRelease={() => moveScene(axis, laneId, scene.sceneId, +1)}
            >
              reduce scene
            </Button>
          </div>
        </div>
      </PanelBase>
    </>
  )
}