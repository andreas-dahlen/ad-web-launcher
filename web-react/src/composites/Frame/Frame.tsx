import type { Directive, DragSettings } from '@composites/comp.types'
import type { PresetMap, SurfaceStyleOverrides } from '../../blocks/Surface/Surface.vars'
import type React from 'react'
import type { LabelSettings } from '../../blocks/Label/Label.types'
import { createId, generateId } from '@utils/idGenerator'
import DragPrim from '@primitives/DragPrim/DragPrim'
import sharedCss from '../comp.module.css'
import { useBehaviorState } from '@composites/hooks/useBehaviorState.hook'
import clsx from 'clsx'
import { Surface } from '../../blocks/Surface/Surface'
import Label from '../../blocks/Label/Label'

type FrameProps = {
  directive?: Directive
  drag?: DragSettings
  styleVars?: SurfaceStyleOverrides
  presets?: PresetMap[]
  className?: string
  label?: LabelSettings
  children: React.ReactNode
}

export default function Frame({
  directive,
  drag,
  styleVars,
  presets,
  className,
  label,
  children
}: FrameProps) {

  const {
    mode,
    movable,
    isDragInteractive,
    inFlow
  } = useBehaviorState({ ...directive })

  const id = generateId()
  const dragId = createId("drag", id, label?.msg)


  const Frame = (
    <>
      <Surface
        mode={mode}
        className={clsx(className, !inFlow && sharedCss.notInFlow)}
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
      onSwipeCommit={drag?.onSwipeCommit && drag.onSwipeCommit}
      className={clsx(inFlow && sharedCss.isInFlow)}
      snapX={drag?.useSettingsSnap ? drag?.snapX : undefined}
      snapY={drag?.useSettingsSnap ? drag?.snapY : undefined}
    >
      {Frame}
    </DragPrim>
  )
  return Frame
}