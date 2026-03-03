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

    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePointerForwarding } from '../interaction/bridge/bridge'

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
})

const emit = defineEmits([
  'press',
  'pressRelease',
  'pressCancel',
  'swipeStart',
  'swipe',
  'swipeCommit',
  'swipeRevert',
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

</script>


<style scoped>
.input-element {
  user-select: none;
  touch-action: none;
  pointer-events: auto;
}
</style>
