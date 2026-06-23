import { Z } from '@config/zIndex';
// import useRuntimeBindings from '../compositions/useRuntimeBindings.hook';
import css from './Layers.module.css'
import InputCarousel from '@primitives/carousel/InputCarousel';
import clsx from 'clsx';
import { layoutStore } from '@app/compositions/layout.store';
import React from 'react';
import type { Axis1D } from '@typing/core.types';

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

  const lock = sceneCount === 1

  return (
    <InputCarousel
      id={laneId}
      axis={axis}
      lockNextAt={lock ? 0 : lockNextAt}
      lockPrevAt={lock ? 0 : lockPrevAt}
    />
  )
})
export default function BaseLayer() {
  const verticalLaneOrder = layoutStore(s => s.vertical.laneOrder)
  const horizontalLaneOrder = layoutStore(s => s.horizontal.laneOrder)

  return (
    <>
      <div className={clsx(css.layer, css.forvertical)} style={{ zIndex: Z.base }}>
        {verticalLaneOrder.map(laneId => (
          <LaneInputRenderer key={laneId} axis="vertical" laneId={laneId} />
        ))}
      </div>

      <div className={clsx(css.layer, css.forhorizontal)} style={{ zIndex: Z.base }}>
        {horizontalLaneOrder.map(laneId => (
          <LaneInputRenderer key={laneId} axis="horizontal" laneId={laneId} />
        ))}
      </div>
    </>
  )
}
// return (
//   <>
//     <div
//       className={clsx(css.layer, css.forvertical)}
//       style={{ zIndex: Z.base }}
//     >
//       {vertical.laneOrder.map(laneId => {
//         const lane = vertical.lanes[laneId]
//         const lock = lane.sceneOrder.length === 1 ? true : false
//         return <InputCarousel
//           key={lane.laneId}
//           id={lane.laneId}
//           axis={lane.axis}
//           lockNextAt={lock ? 0 : lane.lockNextAt}
//           lockPrevAt={lock ? 0 : lane.lockPrevAt}
//         />
//       })}
//     </div>

//     <div
//       className={clsx(css.layer, css.forhorizontal)}
//       style={{ zIndex: Z.base }}
//     >
//       {horizontal.laneOrder.map(laneId => {
//         const lane = horizontal.lanes[laneId]
//         const lock = lane.sceneOrder.length === 1 ? true : false
//         return (
//           <InputCarousel
//             key={lane.laneId}
//             id={lane.laneId}
//             axis={lane.axis}
//             lockNextAt={lock ? 0 : lane.lockNextAt}
//             lockPrevAt={lock ? 0 : lane.lockPrevAt}
//           //TODO later add onSwipeCommit
//           />
//         )
//       })}
//     </div>
//   </>
// )
