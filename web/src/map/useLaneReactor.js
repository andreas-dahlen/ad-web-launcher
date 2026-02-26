import { computed, watch } from 'vue'
import { state } from '../interaction/state/stateManager'

/*
  Available reactive fields per lane type (from state.get()):

  carousel : offset, index, dragging, size, count, progress
  slider   : value, offset, dragging
  drag     : position, offset, dragging
*/

const NEUTRAL = {
  offset:   0,
  progress: 0,
  dragging: false,
  index:    0,
  size:     0,
  count:    0,
  value:    0,
  position: { x: 0, y: 0 }
}

const TYPE_FIELDS = {
  carousel: ['offset', 'index', 'dragging', 'size', 'count', 'progress'],
  slider:   ['value', 'offset', 'dragging'],
  drag:     ['position', 'offset', 'dragging']
}

/**
 * Read-only selector composable for reacting to lane state
 * from anywhere in the component tree — no DOM coupling.
 *
 * @param {Object} opts
 * @param {string}   opts.type       - 'carousel' | 'slider' | 'drag'
 * @param {string}   opts.laneId     - Lane to observe
 * @param {number}   [opts.index]    - Gate to a specific carousel index
 * @param {string[]} [opts.fields]   - Subset of fields to expose (all if omitted)
 * @param {Function} [opts.onCommit]     - Called when a swipe finishes (dragging true→false while active)
 * @param {Function} [opts.onSwipeStart] - Called when a swipe begins  (dragging false→true while active)
 */
export function useLaneReactor({ type, laneId, index, fields, onCommit, onSwipeStart }) {
  const lane = state.get(type, laneId)

  // --- Index gating (carousel only) ---
  const active = computed(() => {
    if (index == null) return true
    if (type !== 'carousel') return true
    return lane.index === index
  })

  // --- Build gated field selectors ---
  const exposed = resolveFields(type, fields)
  const result = { active }

  for (const field of exposed) {
    if (!(field in lane)) continue  // field doesn't exist on this lane view
    result[field] = computed(() =>
      active.value ? lane[field] : NEUTRAL[field]
    )
  }

  // --- Lifecycle watchers ---
  if (onCommit) {
    watch(() => lane.dragging, (now, was) => {
      if (was && !now && active.value) onCommit({ laneId, type, index: lane.index })
    })
  }

  if (onSwipeStart) {
    watch(() => lane.dragging, (now, was) => {
      if (!was && now && active.value) onSwipeStart({ laneId, type, index: lane.index })
    })
  }

  return result
}

function resolveFields(type, fields) {
  const available = TYPE_FIELDS[type] || []
  if (!fields || !fields.length) return available
  return fields.filter(f => available.includes(f))
}
