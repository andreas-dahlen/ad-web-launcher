import clsx from 'clsx';
import css from './Scenes.module.css'
import ButtonPrim from '@primitives/ButtonPrim/ButtonPrim';
import { layoutStore } from '@stores/layout.store';
// import type { Axis1D } from '@typing/core.types';
import { PanelBase } from '../../blocks/Surface/Surface';
import Button from '@composites/Button/Button';
import { systemIcons } from '@data/icons/system';

// type SceneLayoutPanel = {
//   scene: Scene,
//   sceneIdx: number,
//   laneId: string,
//   axis: Axis1D,
//   count: {
//     scene: number,
//     lane: number
//   }
// }

export default function SceneLayoutPanel() {
  const addLane = layoutStore.getState().addLane
  const deleteLane = layoutStore.getState().deleteLane
  const moveLane = layoutStore.getState().moveLane

  const addScene = layoutStore.getState().addScene
  const deleteScene = layoutStore.getState().deleteScene
  const moveScene = layoutStore.getState().moveScene

  // const horizontal = axis === "horizontal"
  return (
    <>
      <div></div>
      {/* <p>current: {sceneIdx}</p>
        <div className={clsx(horizontal && css.vertical, !horizontal && css.vertical)}>
          <div className={clsx(css.buttonrow, horizontal && css.horizontal, !horizontal && css.vertical)}>
            <Button
              Icon={systemIcons.addBottom}
              label={"hello"}
              interactive={count.lane < 5}
              onPressRelease={() => addLane(axis)} />
            <Button
              Icon={systemIcons.trash}
              label={"hello"}
              interactive={count.lane > 1}
              onPressRelease={() => deleteLane(axis, laneId)} />
            <ButtonPrim
              id="move-prev-lane"
              onPressRelease={() => moveLane(axis, laneId, -1)}
            >
              reduce Lane
            </ButtonPrim>
            <ButtonPrim
              id="move-more-lane"
              onPressRelease={() => moveLane(axis, laneId, +1)}
            >
              reduce Lane
            </ButtonPrim>
          </div>
          <div className={clsx(css.buttonrow, horizontal && css.horizontal, !horizontal && css.vertical)}>
            <ButtonPrim
              id="add-scene"
              onPressRelease={() => addScene(axis, laneId)}
            >
              add scene
            </ButtonPrim>
            <ButtonPrim
              id="delete-scene"
              onPressRelease={() => deleteScene(axis, laneId, scene.sceneId)}
            >
              delete scene
            </ButtonPrim>
            <ButtonPrim
              id="move-prev-scene"
              onPressRelease={() => moveScene(axis, laneId, scene.sceneId, -1)}
            >
              reduce scene
            </ButtonPrim>
            <ButtonPrim
              id="move-more-scene"
              onPressRelease={() => moveScene(axis, laneId, scene.sceneId, +1)}
            >
              reduce scene
            </ButtonPrim>
          </div>
        </div> */}
    </>
  )
}