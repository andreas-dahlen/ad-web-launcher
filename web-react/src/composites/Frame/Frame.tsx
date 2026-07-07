import type { Directive, DragSettings } from '@composites/comp.types'
import type { SurfacePreset, SurfaceStyle } from '../../blocks/Surface/Surface.vars'
import type React from 'react'
import { createId, generateId } from '@utils/idGenerator'
import DragPrim from '@primitives/DragPrim/DragPrim'
import { useBehaviorState } from '@composites/hooks/useBehaviorState.hook'
import { Surface } from '../../blocks/Surface/Surface'
import Label, { type LabelSettings } from '../../blocks/Label/Label'

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