import type { Directive, Mode } from '@composites/types/comp.types'
import { settingsStore } from '@stores/settings.store'

export function useBehaviorState({
  mode: inputMode,
  movable = false,
  isInFlow: inputIsInFlow = true
}: Directive) {

  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  const mode = ({
    true: "on",
    false: "off",
    default: "default"
  })[
    inputMode === undefined ? "default" : String(inputMode)
  ] as Mode

  const isInteractive = mode !== "disabled"

  const isDragInteractive = dragEnabled && isInteractive && movable
  const isCompInteractive = (!dragEnabled || !movable) && isInteractive

  const isInFlow = movable ? true : inputIsInFlow

  return {
    mode,
    isInteractive,
    movable,
    isDragInteractive,
    isCompInteractive,
    isInFlow,
  }
}