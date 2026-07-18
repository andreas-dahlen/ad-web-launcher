import { useRef, useEffect } from "react"
import { useMotion } from "./hooks/useMotion.hook.ts"
import { useItemSizing } from './hooks/useItemSizing.hook.ts'
import { useCarouselStore } from './store/useCarouselStore.hook.ts'
import { carouselStore, type NodeId } from './store/carousel.store.ts'
import css from './Carousel.module.css'
import { dasx } from '../../shared/sxCompiler/dasx.ts'
import clsx from 'clsx'
import { svsx } from '../../shared/sxCompiler/svsx.ts'
import type { ContentCarouselPrimProps } from '@primitives/types/prim.types.ts'
import type { SceneRole } from '../../shared/types/core.types.ts'

import { cpsx } from '../../shared/sxCompiler/cpsx.ts'
import { carouselStyle } from '@generated/components/components.ts'
import { carouselPreset } from '@generated/presets/carousel.preset.ts'



function deriveRole(nodeId: NodeId, currentNode: NodeId): SceneRole {
  if (nodeId === currentNode) return 'current'
  if (nodeId === ((currentNode + 1) % 3) as NodeId) return 'next'
  return 'prev'
}

export default function ContentCarouselPrim({
  id,
  axis,
  scenes,
  styleVars,
  presets,
  carouselDataAttrs
}: ContentCarouselPrimProps) {

  // ── Fully subscribe to the carousel store ────────────────────────────────────────
  const { settling, liveOffset, dragging, layout, count, nodeBindings } = useCarouselStore(id)

  // ── Initialize count for mirror scenes ────────────────────────────────────────


  useEffect(() => {
    if (scenes?.length)
      carouselStore.getState().setCount(id, scenes.length ?? count)
  }, [id, scenes?.length, count])

  // ── DOM reference & lane size ──────────────────────────────────────
  const itemRef = useRef<HTMLDivElement>(null)
  useItemSizing({ itemRef: itemRef, id })

  const axisSize = axis === "horizontal" ? layout.containerSize.width : layout.containerSize.height

  // ── Carousel motion  ───────────────────────────────────────────────
  const {
    onTransitionEnd,
    styleForRole
  } = useMotion({
    store: { liveOffset, dragging, settling },
    horizontal: axis === "horizontal",
    axisSize,
    id
  })

  return (
    <div
      className={css.carousel}
      style={{ pointerEvents: "none" }}
      {...dasx({
        id,
        type: "carousel",
        axis,
        ...carouselDataAttrs
      })}
    >
      {nodeBindings && nodeBindings.nodes.map((node) => {
        const role = deriveRole(node.nodeId, nodeBindings.currentNode)
        const Scene = scenes ? scenes[node.sceneIdx] : undefined
        return (
          <div
            key={node.nodeId}
            ref={itemRef}
            className={clsx(css.scene, cpsx(presets, carouselPreset))}
            style={{ ...styleForRole(role), ...svsx(styleVars ?? {}, carouselStyle) }}
            data-role={role}
            onTransitionEnd={onTransitionEnd}
          >
            {Scene}
          </div>
        )
      })}
    </div>
  )
}