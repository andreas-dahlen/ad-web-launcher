import { useRef, useEffect } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.hook.ts'
import { useCarouselMotion } from "./hooks/useCarouselMotion.hook.ts"
import { useCarouselSizing } from "./hooks/useCarouselSizing.hook.ts"
import { useAugmentedScenes } from "./hooks/useAugmentedScenes.hook.ts"
import { useCarouselStore } from './store/useCarouselStore.hook.ts'
import { carouselStore, type NodeId } from './store/carousel.store.ts'
import { SceneContext } from './hooks/useSceneContext.hook.ts'
import carouselCss from './Carousel.module.css'
import clsx from 'clsx'
import { dasx } from '../../shared/utils/dataAttrs.ts'
import type { CarouselProps } from '@primitives/prim.types.ts'
import type { SceneRole } from '@typing/core.types.ts'



function deriveRole(nodeId: NodeId, currentNode: NodeId): SceneRole {
  if (nodeId === currentNode) return 'current'
  if (nodeId === ((currentNode + 1) % 3) as NodeId) return 'next'
  return 'prev'
}

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

  // ── Fully subscribe to the carousel store ────────────────────────────────────────
  const { settling, liveOffset, count, dragging, layout, nodeBindings } = useCarouselStore(id)

  // ── Initialize count for mirror scenes ────────────────────────────────────────


  useEffect(() => {
    if (!interactive && scenes?.length)
      carouselStore.getState().setCount(id, scenes.length ?? sceneCount)
  }, [id, scenes?.length, interactive, sceneCount])

  // ── DOM reference & lane size ──────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  useCarouselSizing({ elRef: containerRef, sceneRef: itemRef, id })

  const axisSize = axis === "horizontal" ? layout.containerSize.width : layout.containerSize.height

  // ── Pointer forwarding for gestures ──────────────────────────────────────
  usePointerBridge({
    elRef: containerRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.detail === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Augmented scenes & stable slot management ───────────────────────────────────────────────
  const augmentedScenes = useAugmentedScenes(scenes ?? [], count)


  // ── Carousel motion  ───────────────────────────────────────────────
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
      {nodeBindings && nodeBindings.nodes.map((node) => {
        const role = deriveRole(node.nodeId, nodeBindings.currentNode)
        const Scene = augmentedScenes[node.sceneIdx]
        return (
          <div
            key={node.nodeId}
            ref={itemRef}
            className={clsx(carouselCss.scene)}
            style={styleForRole(role)}
            data-role={role}
            onTransitionEnd={onTransitionEnd}
          >
            <SceneContext.Provider value={{ sceneIdx: node.sceneIdx, carouselId: id }}>
              {Scene && <Scene />}
            </SceneContext.Provider>
          </div>
        )
      })}
    </div>
  )
}