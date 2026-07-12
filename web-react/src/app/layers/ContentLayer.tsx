import { Z } from '@config/zIndex.config'
import css from './Layers.module.css'
import ContentCarouselPrim from '@primitives/Carousel/ContentCarouselPrim'
import { Scenes } from '@app/scenes/Scenes'
import clsx from 'clsx'
import React from 'react'
import { layoutStore } from '@stores/layout.store'
import type { Axis1D } from '@typing/core.types'
import { SceneContext } from '@primitives/Carousel/hooks/useSceneContext.hook'
/** LAYER 2/3! Interactive=false carousel. Contents are mounted inside!
 * The carousel swipes are handled by baseLayer. */

// ---------------------------
// SceneRenderer
// ---------------------------
const SceneRenderer = React.memo(function SceneRenderer({
  axis,
  laneId,
  sceneId,
  index
}: {
  axis: Axis1D
  laneId: string
  sceneId: string
  index: number
}) {
  // const _scene = layoutStore(s => s[axis].lanes[laneId].scenes[sceneId])
  const laneCount = layoutStore(s =>
    s[axis].laneOrder.length
  )

  const sceneCount = layoutStore(s =>
    s[axis].lanes[laneId]?.sceneOrder.length ?? 0
  )
  return (
    <SceneContext.Provider value={{
      sceneIdx: index,
      laneId: laneId,
      axis: axis,
      sceneId: sceneId,
      laneCount: laneCount,
      sceneCount: sceneCount
    }}>

      <Scenes
        axis={axis}
      />
    </SceneContext.Provider>
  )
})

// ---------------------------
// LaneRenderer
// ---------------------------
const LaneRenderer = React.memo(function LaneRenderer({
  axis,
  laneId
}: {
  axis: Axis1D
  laneId: string
}) {
  const sceneOrder = layoutStore(
    s => s[axis].lanes[laneId].sceneOrder)

  return (
    <ContentCarouselPrim
      id={laneId}
      axis={axis}
      scenes={sceneOrder.map((sceneId, index) => (
        <SceneRenderer
          key={sceneId}
          axis={axis}
          laneId={laneId}
          sceneId={sceneId}
          index={index}
        />
      ))}
    />
  )
})
// ---------------------------
// ContentLayer
// ---------------------------
export default function ContentLayer() {
  const verticalLaneOrder = layoutStore(s => s.vertical.laneOrder)
  const horizontalLaneOrder = layoutStore(s => s.horizontal.laneOrder)

  return (
    <>
      {/* Horizontal */}
      <div className={clsx(css.layer, css.forhorizontal, "center")} style={{ zIndex: Z.content }}>
        {horizontalLaneOrder.map(laneId => (
          <LaneRenderer key={laneId} axis="horizontal" laneId={laneId} />
        ))}
      </div>

      {/* Vertical */}
      <div className={clsx(css.layer, css.forvertical, "center")} style={{ zIndex: Z.content }}>
        {verticalLaneOrder.map(laneId => (
          <LaneRenderer key={laneId} axis="vertical" laneId={laneId} />
        ))}
      </div>
    </>
  )
}