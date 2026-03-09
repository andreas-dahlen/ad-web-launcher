<template>
  <div
    ref="dragEl" 
    class="non-interactive-default">
    <div ref="dragItem" 
      class="interactive-default"
      :style="itemStyle" 
      :data-id="id"
      data-axis="both" 
      data-type="drag"
      :data-locked="locked || null"
      :data-snap-x="snapX"
      :data-snap-y="snapY"
      :data-react-swipe-commit="reactSwipeCommit ? true : null">
      <slot name="drag-content"/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { state } from '../state/stateManager'
import { useDragSizing } from './composables/useLaneSizing'
import { usePointerForwarding } from '../bridge/bridge'
import { useDragMotion } from './composables/useLaneMotion'

const emit = defineEmits(['swipeCommit'])

const props = defineProps({
  id: { type: String, required: true },
  snapX: { type: Number, required: false },
  snapY: { type: Number, required: false },
  locked: { type: Boolean, default: false },
  reactSwipeCommit: { type: Boolean, default: false }
})

const dragEl = ref(null)
const dragItem = ref(null)

const laneState = state.get('drag', props.id)
const lanePosition = computed(() => laneState.position ?? { x: 0, y: 0 })
const offset = computed(() => laneState.offset ?? { x: 0, y: 0 })
const dragging = computed(() => laneState.dragging ?? false)
watchEffect(() => state.ensure('drag', props.id))

useDragSizing({
  containerRef: dragEl,
  itemRef: dragItem,
  id: computed(() => props.id)
})

usePointerForwarding({
  elRef: dragItem,
  onReaction(e) {
    if (!props.reactSwipeCommit) return
    if (e.detail?.event !== 'swipeCommit') return
    emit('swipeCommit', e.detail)
  }
})

const { itemStyle } = useDragMotion({
  lanePosition,
  offset,
  dragging
})
</script>

<style scoped>
.non-interactive-default {
  position: relative;
  pointer-events: none;
}

.interactive-default {
  position: absolute;
  user-select: none;
  pointer-events: auto;
}
</style>
