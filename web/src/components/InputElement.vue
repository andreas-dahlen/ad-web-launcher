<template>
  <!--
    InputElement.vue
    ----------------
    Generic gesture surface. Declares gestures for engine and optionally emits Vue events.
    Optionally subscribes to a lane's reactive state via lane-* props (CSS vars + data attrs).
  -->
  <div
    class="input-element"
    ref="el"

    :data-press="press ? true : null"
    :data-swipe="swipe ? true : null"
    :data-action="action || null"
    :data-axis="axis || null"
    :data-swipe-type="swipeType || null"

    :data-react-press="reactPress ? true : null"
    :data-react-press-release="reactPressRelease ? true : null"
    :data-react-press-cancel="reactPressCancel ? true : null"
    :data-react-swipe="reactSwipe ? true : null"
    :data-react-swipe-start="reactSwipeStart ? true : null"
    :data-react-swipe-commit="reactSwipeCommit ? true : null"
    :data-react-swipe-revert="reactSwipeRevert ? true : null"
    :data-react-selected="reactSelected ? true : null"
    :data-react-deselected="reactDeselected ? true : null"

    :data-lane-active="laneActive"
    :style="laneStyle"

    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePointerForwarding } from '../interaction/bridge/bridge'
import { useLaneReactor } from '../map/useLaneReactor'

defineOptions({ name: 'InputElement' })

const props = defineProps({
  action: String,
  press: { type: Boolean, default: false },
  swipe: { type: Boolean, default: false },
  axis: { type: String, default: undefined },
  swipeType: { type: String, default: undefined },

  reactPress: { type: Boolean, default: false },
  reactPressRelease: { type: Boolean, default: false },
  reactPressCancel: { type: Boolean, default: false },
  reactSwipe: { type: Boolean, default: false },
  reactSwipeStart: { type: Boolean, default: false },
  reactSwipeCommit: { type: Boolean, default: false },
  reactSwipeRevert: { type: Boolean, default: false },
  reactSelected: { type: Boolean, default: false },
  reactDeselected: { type: Boolean, default: false },

  // --- Lane subscription (opt-in) ---
  laneType:   { type: String, default: undefined },   // 'carousel' | 'slider' | 'drag'
  laneId:     { type: String, default: undefined },
  laneIndex:  { type: Number, default: undefined },    // carousel index gate
  laneFields: { type: Array,  default: undefined },    // e.g. ['progress', 'offset']
})

const emit = defineEmits([
  'press',
  'pressRelease',
  'pressCancel',
  'swipeStart',
  'swipe',
  'swipeCommit',
  'swipeRevert',
  'select',
  'deselect',
  'laneCommit',
  'laneSwipeStart'
])

const el = ref(null)

/* -------------------------
   Gesture forwarding (existing)
-------------------------- */
function handleReaction(e) {
  const type = e.detail?.type
  if (!type) return

  if (type === 'press' && !props.reactPress) return
  if (type === 'pressRelease' && !props.reactPressRelease) return
  if (type === 'pressCancel' && !props.reactPressCancel) return
  if (type === 'swipeStart' && !props.reactSwipeStart) return
  if (type === 'swipe' && !props.reactSwipe) return
  if (type === 'swipeCommit' && !props.reactSwipeCommit) return
  if (type === 'swipeRevert' && !props.reactSwipeRevert) return
  if (type === 'select' && !props.reactSelected) return
  if (type === 'deselect' && !props.reactDeselected) return

  emit(type, e.detail)
}

usePointerForwarding({
  elRef: el,
  onReaction: handleReaction
})

/* -------------------------
   Lane subscription (opt-in)
   Sets CSS custom properties on the root element:
     --lane-offset, --lane-progress, --lane-dragging,
     --lane-value, --lane-position-x, --lane-position-y
   Sets data-lane-active attribute for CSS selectors.
   Emits laneCommit / laneSwipeStart when lifecycle triggers.
-------------------------- */
const hasLane = props.laneType && props.laneId
let laneReactor = null

if (hasLane) {
  laneReactor = useLaneReactor({
    type: props.laneType,
    laneId: props.laneId,
    index: props.laneIndex,
    fields: props.laneFields,
    onCommit(detail)     { emit('laneCommit', detail) },
    onSwipeStart(detail) { emit('laneSwipeStart', detail) }
  })
}

const laneActive = computed(() => {
  if (!laneReactor) return null
  return laneReactor.active.value ? true : null
})

const laneStyle = computed(() => {
  if (!laneReactor) return undefined
  const r = laneReactor
  const style = {}

  if (r.offset)   style['--lane-offset']   = r.offset.value
  if (r.progress)  style['--lane-progress']  = r.progress.value
  if (r.dragging)  style['--lane-dragging']  = r.dragging.value ? 1 : 0
  if (r.index)     style['--lane-index']     = r.index.value
  if (r.size)      style['--lane-size']      = r.size.value
  if (r.count)     style['--lane-count']     = r.count.value
  if (r.value != null) style['--lane-value'] = r.value.value
  if (r.position) {
    const pos = r.position.value
    style['--lane-position-x'] = pos?.x ?? 0
    style['--lane-position-y'] = pos?.y ?? 0
  }

  return style
})
</script>


<style scoped>
.input-element {
  user-select: none;
  touch-action: none;
  z-index: 10;
}
</style>
