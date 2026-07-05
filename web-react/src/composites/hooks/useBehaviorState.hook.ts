import type { Directive } from '@composites/comp.types'
import { settingsStore } from '@stores/settings.store'

export function useBehaviorState({
  mode: inputMode,
  movable = false,
  isInFlow: inputIsInFlow = true
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

  const isInFlow = movable ? true : inputIsInFlow

  return {
    mode,
    interactive,
    movable,
    isDragInteractive,
    isCompInteractive,
    isInFlow,
  }
}