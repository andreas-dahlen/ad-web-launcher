import clsx from 'clsx';
import css from './Scenes.module.css'
import ButtonPrim from '@primitives/Button/ButtonPrim';
import { layoutStore, type Scene } from '@stores/layout.store';
import type { Axis1D } from '@typing/core.types';
import { useSceneContext } from '@primitives/Carousel/hooks/useSceneContext.hook';
import Button from '@composites/Button/Button';
import { carouselStore } from '@primitives/Carousel/store/carousel.store';
import Frame from '@composites/Frame/Frame';
import Label from '../../blocks/Label/Label';
import * as Icons from '@data/icons/index.barrel'

type SceneLayoutPanel = {
  scene: Scene,
  sceneIdx: number,
  laneId: string,
  axis: Axis1D,
  count: {
    scene: number,
    lane: number
  }
}

export default function SceneLayoutPanel() {

  const addScene = layoutStore.getState().addScene
  const deleteScene = layoutStore.getState().deleteScene
  const moveScene = layoutStore.getState().moveScene
  const purgeScene = carouselStore.getState().purgeScene

  const { sceneIdx, laneId, sceneId, axis, laneCount, sceneCount } = useSceneContext()

  const horizontal = axis === "horizontal"
  return (
    <>
      {/* <div></div>
      <p>current: {sceneIdx}</p>
      <div className={clsx(horizontal && css.vertical, !horizontal && css.vertical)}>
        <div className={clsx(css.buttonrow, horizontal && css.horizontal, !horizontal && css.vertical)}> */}
      <Frame presets={["bg", "frame"]}>

        <Label msg={`Scene: ${sceneIdx}`} styleVars={{ position: "relative" }} position={"center"}></Label>

        <Frame presets={["row"]} styleVars={{ gap: "1rem" }}>

          <Button
            //  directive={{ mode: laneCount === 1 ? "disabled" : "default" }}
            //TODO add max scene count in settingsStore? or whereever? and do laneCount<max
            button={{ onPressRelease: () => addScene(axis, laneId) }}
            label={{ msg: "add" }}
            icon={{ Svg: Icons.plus, variant: "bold" }}
          />
          <Button
            directive={{ mode: sceneCount === 1 ? "disabled" : "default" }}
            button={{
              onPressRelease: () => {
                deleteScene(axis, laneId, sceneId)
                purgeScene(laneId, sceneIdx)
              }
            }}
            label={{ msg: "delete" }}
            icon={{ Svg: Icons.trash }}
          />
        </Frame>

        <Frame presets={["row"]} styleVars={{ gap: "1rem" }}>

          <Button
            directive={{ mode: sceneCount === 1 ? "disabled" : "default" }}
            button={{ onPressRelease: () => moveScene(axis, laneId, sceneId, -1) }}
            label={{ msg: "move left" }}
            icon={{ Svg: Icons.moveLeft }}
          />
          <Button
            directive={{ mode: sceneCount === 1 ? "disabled" : "default" }}
            button={{ onPressRelease: () => moveScene(axis, laneId, sceneId, 1) }}
            label={{ msg: "move right" }}
            icon={{ Svg: Icons.moveRight }}
          />
        </Frame>
      </Frame>
    </>
  )
}