import { useRef, useEffect } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.hook.ts'
import { useCarouselMotion } from "./hooks/useCarouselMotion.hook.ts"
import { useCarouselSizing } from "./hooks/useCarouselSizing.hook.ts"
import { useAugmentedScenes } from "./hooks/useAugmentedScenes.hook.ts"
import { useCarouselStore } from './store/useCarouselStore.hook.ts'
import { carouselStore } from './store/carousel.store.ts'
import { SceneContext } from './hooks/useSceneContext.hook.ts'
import carouselCss from './Carousel.module.css'
import clsx from 'clsx'
import { dasx } from '../../shared/utils/dataAttrs.ts'
import type { CarouselProps } from '@primitives/prim.types.ts'
import type { SceneRole } from '@typing/core.types.ts'

// ── Ring buffer types ────────────────────────────────────────────────
type NodeIdx = 0 | 1 | 2

// type NodeBinding = {
//   nodeIdx: NodeIdx
//   sceneIdx: number
// }

// type RingState = {
//   nodes: [NodeBinding, NodeBinding, NodeBinding]
//   currentNode: NodeIdx
// }

// type RingAction = {
//   type: 'commit'
//   direction: Direction
//   total: number
// }
function deriveRole(nodeIdx: NodeIdx, currentNode: NodeIdx): SceneRole {
  if (nodeIdx === currentNode) return 'current'
  if (nodeIdx === ((currentNode + 1) % 3) as NodeIdx) return 'next'
  return 'prev'
}

// function ringReducer(state: RingState, action: RingAction): RingState {
//   console.log('ringReducer called', state, action)
//   const { currentNode, nodes } = state
//   const isNext = action.direction.dir === 'right' || action.direction.dir === 'down'

//   // which node is leading edge (about to become current)
//   const leadingNode = (isNext
//     ? (currentNode + 1) % 3
//     : (currentNode + 2) % 3) as NodeIdx

//   // which node is stale (just left the visible window)
//   const staleNode = (isNext
//     ? (currentNode + 2) % 3
//     : (currentNode + 1) % 3) as NodeIdx

//   // new scene for stale node = one step beyond leading edge
//   const newSceneIdx = isNext
//     ? (nodes[leadingNode].sceneIdx + 1) % action.total
//     : (nodes[leadingNode].sceneIdx - 1 + action.total) % action.total

//   const newCurrentNode = leadingNode

//   const newNodes = nodes.map(n =>
//     n.nodeIdx === staleNode
//       ? { ...n, sceneIdx: newSceneIdx }
//       : n
//   ) as [NodeBinding, NodeBinding, NodeBinding]
//   const result = { nodes: newNodes, currentNode: newCurrentNode }
//   console.log('reducer returning', result)
//   return result
// }

// const initialRingState: RingState = {
//   nodes: [
//     { nodeIdx: 0, sceneIdx: 0 },
//     { nodeIdx: 1, sceneIdx: 1 },
//     { nodeIdx: 2, sceneIdx: 2 },
//   ],
//   currentNode: 1
// }


export default function Carousel({
  id,
  axis,
  scenes,
  sceneCount,
  lockPrevAt,
  lockNextAt,
  onSwipeCommit,
  carouselDataAttrs,
  interactive = true
}: CarouselProps) {

  // ── Fully subscribe to the carousel store ─────────────────────────────
  const { settling, liveOffset, count, dragging, layout, ring } = useCarouselStore(id)

  // ── Initialize count for mirror scenes ─────────────────────────────


  useEffect(() => {
    if (!interactive && scenes?.length)
      carouselStore.getState().setCount(id, scenes.length ?? sceneCount)
  }, [id, scenes?.length, interactive, sceneCount])

  // ── DOM reference & lane size ─────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  useCarouselSizing({ elRef: containerRef, sceneRef: itemRef, id })

  const axisSize = axis === "horizontal" ? layout.containerSize.width : layout.containerSize.height

  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerBridge({
    elRef: containerRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.detail === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Augmented scenes & stable slot management ─────────────────────────────
  const augmentedScenes = useAugmentedScenes(scenes ?? [], count)

  // ── Ring buffer ──────────────────────────────────────────────────
  // const [ring, dispatchRing] = useReducer(ringReducer, initialRingState)


  // ── Carousel motion / styling ─────────────────────────────
  const {
    onTransitionEnd,
    styleForRole
  } = useCarouselMotion({
    store: { liveOffset, dragging, settling },
    horizontal: axis === "horizontal",
    axisSize,
    id
  })

  return (
    <div
      className={carouselCss.carousel}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      ref={containerRef}
      {...dasx({
        id,
        type: "carousel",
        axis,
        frame: "carousel",
        lockNextAt,
        lockPrevAt,
        ...carouselDataAttrs
      })}
    >
      {ring && ring.nodes.map((node) => {
        const role = deriveRole(node.nodeIdx as NodeIdx, ring.currentNode)
        const Scene = augmentedScenes[node.sceneIdx]
        // console.log("ring.nodes: ", ring.nodes, "currentNode: ", ring.currentNode)
        return (
          <div
            key={node.nodeIdx}
            ref={itemRef}
            className={clsx(carouselCss.scene, /*interactive && setColor(slot.sceneIdx)*/)}
            style={styleForRole(role)}
            data-role={role}
            onTransitionEnd={onTransitionEnd}
          >
            <SceneContext.Provider value={{ sceneIndex: node.sceneIdx, carouselId: id }}>
              {Scene && <Scene />}
            </SceneContext.Provider>
          </div>
        )
      })}
    </div>
  )
}