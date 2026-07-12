import { systemIcons } from '@data/icons/system'

type sceneLayoutPanel = {
  scene: Scene,
  sceneIdx: number,
  laneId: string,
  axis: Axis1D,
  count: {
    scene: number,
    lane: number
  }
}

export default function SceneLayoutPanel({
  scene,
  sceneIdx,
  laneId,
  axis,
  count
}: ButtonLayout) {

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
              onPressRelease={() => moveLane(axis, laneId, 1)}
            >
              reduce Lane
            </ButtonPrim>
          </div>
        </div>
      </PanelBase>
    </>
  )

}