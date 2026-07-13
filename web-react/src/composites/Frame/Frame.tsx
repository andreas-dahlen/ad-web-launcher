import type { Directive, DragSettings } from '@composites/types/comp.types'
import type { SurfacePreset } from '../../blocks/Surface/Surface.vars'
import type React from 'react'
import { createId, generateId } from '@data/generators/idGenerator'
import DragPrim from '@primitives/Drag/DragPrim'
import { useBehaviorState } from '@composites/hooks/useBehaviorState.hook'
import { Surface } from '../../blocks/Surface/Surface'
import Label, { type LabelSettings } from '../../blocks/Label/Label'
import type { SurfaceStyle } from '@schema/components'

type FrameProps = {
  directive?: Directive
  drag?: DragSettings
  styleVars?: SurfaceStyle
  presets?: SurfacePreset[]
  label?: LabelSettings
  children: React.ReactNode
}

export default function Frame({
  directive,
  drag,
  styleVars,
  presets,
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
    <>
      <Surface
        isInFlow={isInFlow}
        styleVars={styleVars}
        presets={presets}
      >
        {label && <Label
          msg={label.msg}
          mode={mode}
          position={label.position}
        />}
        {children}

      </Surface>
    </>
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