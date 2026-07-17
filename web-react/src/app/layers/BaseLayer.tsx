import { Z } from '@config/zIndex.config';
// import useRuntimeBindings from '../compositions/useRuntimeBindings.hook';
import css from './Layers.module.css'
import InputCarouselPrim from '@primitives/Carousel/InputCarouselPrim';
import clsx from 'clsx';
import { layoutStore } from '@stores/layout.store';
import React from 'react';
import type { Axis1D } from '../../shared/types/core.types';

// Layer 1/3 scenes read inputs here!
const LaneInputRenderer = React.memo(function LaneInputRenderer({
  axis,
  laneId
}: {
  axis: Axis1D
  laneId: string
}) {
  const lockNextAt = layoutStore(s => s[axis].lanes[laneId].lockNextAt)
  const lockPrevAt = layoutStore(s => s[axis].lanes[laneId].lockPrevAt)
  const sceneCount = layoutStore(s => s[axis].lanes[laneId].sceneOrder.length)

  const isLocked = sceneCount === 1

  return (
    <InputCarouselPrim
      id={laneId}
      axis={axis}
      lockNextAt={isLocked ? 0 : lockNextAt}
      lockPrevAt={isLocked ? 0 : lockPrevAt}
    />
  )
})
export default function BaseLayer() {
  const verticalLaneOrder = layoutStore(s => s.vertical.laneOrder)
  const horizontalLaneOrder = layoutStore(s => s.horizontal.laneOrder)

  return (
    <>
      <div className={clsx(css.layer, css.forvertical, "center")} style={{ zIndex: Z.base }}>
        {verticalLaneOrder.map(laneId => (
          <LaneInputRenderer key={laneId} axis="vertical" laneId={laneId} />
        ))}
      </div>

      <div className={clsx(css.layer, css.forhorizontal, "center")} style={{ zIndex: Z.base }}>
        {horizontalLaneOrder.map(laneId => (
          <LaneInputRenderer key={laneId} axis="horizontal" laneId={laneId} />
        ))}
      </div>
    </>
  )
} //TODO add swipeCommit?