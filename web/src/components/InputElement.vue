<template>
  <!--
    InputElement.vue
    ----------------
    Generic gesture surface. Declares gestures for engine and optionally emits Vue events.
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
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { intentDeriver } from '../interaction/input/intentDeriver'

defineOptions({ name: 'InputElement' })

// -------------------------------
// Props: configure engine eligibility
// -------------------------------
const {
  action,
  press,
  swipe,
  axis,
  swipeType,
  reactPress,
  reactPressRelease,
  reactPressCancel,
  reactSwipe,
  reactSwipeStart,
  reactSwipeCommit,
  reactSwipeRevert,
  reactSelected,
  reactDeselected
} = defineProps({
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
  reactDeselected: { type: Boolean, default: false }
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
  'deselect'
])

const el = ref(null)

// Build a minimal context packet for intentDeriver using DOM + current state.
function buildContext(targetEl) {
  if (!targetEl) return null
  const ds = targetEl.dataset || {}
  const ctx = {
    element: targetEl,
    laneId: ds.lane || null,
    axis: ds.axis || axis || null,
    swipeType: ds.swipeType || swipeType || null,
    actionId: ds.action || action || null,
    reactions: {
      press: press || reactPress || reactPressRelease || reactPressCancel,
      pressRelease: press || reactPressRelease,
      pressCancel: press || swipe || reactPressCancel || reactPressRelease,
      swipeStart: swipe || reactSwipe || reactSwipeStart || reactSwipeCommit || reactSwipeRevert,
      swipe: swipe || reactSwipe,
      swipeCommit: swipe || reactSwipeCommit,
      swipeRevert: swipe || reactSwipeRevert,
      select: reactSelected,
      deselect: reactDeselected
    }
  }

  // Placeholder for future fallback resolution (e.g., domRegistry lookup).
  return ctx
}

// -------------------------------
// Handle reactions from engine
// -------------------------------
function handleReaction(e) {
  const type = e.detail?.type
  if (!type) return

  // Only emit Vue event if corresponding react* prop is true
  if (type === 'press' && !reactPress) return
  if (type === 'pressRelease' && !reactPressRelease) return
  if (type === 'pressCancel' && !reactPressCancel) return
  if (type === 'swipeStart' && !reactSwipeStart) return
  if (type === 'swipe' && !reactSwipe) return
  if (type === 'swipeCommit' && !reactSwipeCommit) return
  if (type === 'swipeRevert' && !reactSwipeRevert) return
  if (type === 'select' && !reactSelected) return
  if (type === 'deselect' && !reactDeselected) return

  emit(type, e.detail)
}

// Pointer event forwarding — Vue owns DOM listeners, engine receives (x, y) only.
function handlePointerDown(e) {
  e.stopPropagation()
  e.currentTarget.setPointerCapture(e.pointerId)
  intentDeriver.onDown(e.clientX, e.clientY, buildContext(e.currentTarget))
}
function handlePointerMove(e) {
  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
  intentDeriver.onMove(e.clientX, e.clientY)
}
function handlePointerUp(e) {
  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
  intentDeriver.onUp(e.clientX, e.clientY)
}

onMounted(() => {
  const root = el.value
  if (root) {
    root.addEventListener('pointerdown', handlePointerDown)
    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerup', handlePointerUp)
    root.addEventListener('pointercancel', handlePointerUp)
    root.addEventListener('reaction', handleReaction)
  }
})

onBeforeUnmount(() => {
  const root = el.value
  if (root) {
    root.removeEventListener('pointerdown', handlePointerDown)
    root.removeEventListener('pointermove', handlePointerMove)
    root.removeEventListener('pointerup', handlePointerUp)
    root.removeEventListener('pointercancel', handlePointerUp)
    root.removeEventListener('reaction', handleReaction)
  }
})
</script>

<style scoped>
.input-element {
  user-select: none;
  touch-action: none;
}
</style>
