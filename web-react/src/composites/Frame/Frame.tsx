import type { Directive, DragSettings } from '@composites/types/comp.types'
import type React from 'react'
import { createId, generateId } from '@data/generators/idGenerator'
import DragPrim from '@primitives/Drag/DragPrim'
import { useBehaviorState } from '@composites/hooks/useBehaviorState.hook'
import { Layout, type LayoutSettings } from '@blocks/Layout/Layout'
import Label, { type LabelSettings } from '../../blocks/Label/Label.ts'
import { Visual, type VisualSettings } from '@blocks/visual/Visual'

type FrameProps = {
  directive?: Directive
  drag?: DragSettings
  visual?: VisualSettings
  layout?: LayoutSettings
  label?: LabelSettings
  children: React.ReactNode
}

export default function Frame({
  directive,
  drag,
  visual,
  layout,
  label,
  children
}: FrameProps) {

  const {
    mode,
    movable,
    isDragInteractive,
    isInFlow
  } = useBehaviorState({ ...directive })

  const id = generateId()
  const dragId = createId("drag", id, label?.msg)


  const Frame = (
    <div style={{ position: isInFlow ? "relative" : "absolute" }}>
      <Layout
        styleVars={layout?.styleVars}
        presets={layout?.presets}
      >
        <Visual
          styleVars={visual?.styleVars}
          presets={visual?.presets}
        />
        {children}


        {label && <Label
          msg={label.msg}
          mode={mode}
          position={label.position}
        />}



      </Layout>
    </div>
  )

  if (movable) return (
    <DragPrim
      id={dragId}
      useSettingsSnap={drag?.useSettingsSnap}
      interactive={isDragInteractive}
      isInFlow={isInFlow}
      onSwipeCommit={drag?.onSwipeCommit && drag.onSwipeCommit}
      snapX={drag?.useSettingsSnap ? drag?.snapX : undefined}
      snapY={drag?.useSettingsSnap ? drag?.snapY : undefined}
    >
      {Frame}
    </DragPrim>
  )
  return Frame
}