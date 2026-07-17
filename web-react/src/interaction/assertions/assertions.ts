import type { Computed, ScrollComputed, SliderComputed } from '@interaction/types/runtime/computed.types'
import type { Axis, InteractionType, BoxSide } from '../../shared/types/core.types'

export const VALID_DIRS = new Set<BoxSide>(['left', 'right', 'top', 'bottom'])

export const VALID_AXES = new Set<Axis>(['horizontal', 'vertical', 'both'])
export const VALID_TYPES = new Set<InteractionType>(['button', 'carousel', 'slider', 'drag', 'scroll'])

export function toAxis(v: string | undefined): Axis | null {
  return v != null && VALID_AXES.has(v as Axis) ? v as Axis : null
}
export function toType(v: string | undefined): InteractionType | null {
  return v != null && VALID_TYPES.has(v as InteractionType) ? v as InteractionType : null
}

export function toOverflowSide(overflowSide: string | undefined): BoxSide | null {
  return overflowSide != null && VALID_DIRS.has(overflowSide as BoxSide) ? overflowSide as BoxSide : null
}

export function assertAxis(v: string): asserts v is Axis {
  if (!VALID_AXES.has(v as Axis)) {
    throw new Error('Invalid axis')
  }
}

export function assertSliderComputed(computed: Computed): asserts computed is SliderComputed {
  if (!computed) throw new Error("computed is required for slider")
}
export function assertScrollComputed(computed: Computed): asserts computed is ScrollComputed {
  if (!computed) throw new Error("computed is required for scroll")
}