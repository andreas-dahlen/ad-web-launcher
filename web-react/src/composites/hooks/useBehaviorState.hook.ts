import type { Directive } from '@composites/comp.types'
import { settingsStore } from '@stores/settings.store'

export function useBehaviorState({
  mode: inputMode,
  movable = false,
  inFlow: inputInFlow = true
}: Directive) {

  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  const mode =
    inputMode === true ? "on" :
      inputMode === false ? "off" :
        inputMode === undefined ? "default" :
          inputMode

  const interactive = mode !== "disabled"

  const isDragInteractive = dragEnabled && interactive && movable
  const isCompInteractive = (!dragEnabled || !movable) && interactive

  const inFlow = movable ? true : inputInFlow

  return {
    mode,
    interactive,
    movable,
    isDragInteractive,
    isCompInteractive,
    inFlow,
  }
}