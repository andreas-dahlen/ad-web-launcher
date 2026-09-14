import type { Directive, Mode } from '@composites/types/comp.types.ts'
import { settingsStore } from '@stores/settings.store.ts'

export function useBehaviorState({
  mode: inputMode,
  interactive,
  movable = false,
  isInFlow: inputIsInFlow = true
}: Directive) {

  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  let mode: Mode = "default";

  if (typeof inputMode === "boolean") {
    mode = inputMode ? "on" : "off";
  } else if (inputMode) {
    mode = inputMode;
  }

  const isInteractive = interactive ?? true

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