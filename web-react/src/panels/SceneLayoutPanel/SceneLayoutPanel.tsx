import { layoutStore, type Scene } from '@stores/layout.store.ts';
import type { Axis1D } from '../../shared/types/core.types.ts';
import { useSceneContext } from '@primitives/Carousel/hooks/useSceneContext.hook.ts';
import Button from '@composites/Button/Button.tsx';
import { carouselStore } from '@primitives/Carousel/store/carousel.store.ts';
import Frame from '@composites/Frame/Frame.tsx';
import Label from '../../blocks/Label/Label.tsx';
import * as Icons from '@data/icons'

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

  const { sceneIdx, laneId, sceneId, axis, sceneCount } = useSceneContext()

  // const horizontal = axis === "horizontal"
  return (
    <>
      {/* <div></div>
      <p>current: {sceneIdx}</p>
      <div className={clsx(horizontal && css.vertical, !horizontal && css.vertical)}>
        <div className={clsx(css.buttonrow, horizontal && css.horizontal, !horizontal && css.vertical)}> */}
      <Frame directive={{ isInFlow: false }} layout={{ presets: "row" }}>

        <Label msg={`Scene: ${sceneIdx}`} styleVars={{ position: "absolute" }} position={"left"}></Label>

        <Button
          directive={{ mode: sceneCount === 1 ? "disabled" : "default" }}
          button={{ onPressRelease: () => moveScene(axis, laneId, sceneId, -1) }}
          label={{ msg: "move left" }}
          icon={{ Svg: Icons.moveLeft }}
        />

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


        <Frame>

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