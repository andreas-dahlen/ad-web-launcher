<template>
  <div ref="carouselEl" class="carousel" 
    :style="carouselStyle" 
    :data-lane="lane" 
    :data-axis="axis"
    :data-swipe-type="'carousel'" 
    :data-react-swipe-commit="reactSwipeCommit ? true : null">

    <component 
      v-if="totalScenes > 0" 
      :is="prevScene" 
      class="scene" 
      :style="prevStyle" />

    <component 
      v-if="totalScenes > 0" 
      :is="currentScene" class="scene" 
      :style="currentStyle"
      @transitionend="onTransitionEnd" />

    <component v-if="totalScenes > 0" 
      :is="nextScene" class="scene" 
      :style="nextStyle" />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, markRaw } from 'vue'
import { state } from '../interaction/state/stateManager'
import { APP_SETTINGS } from '../config/appSettings'
import { useLaneSizing } from '../interaction/adapters/useCarouselSizing'
import { usePointerForwarding } from '../interaction/bridge/bridge'

const emit = defineEmits(['swipeCommit'])

const props = defineProps({
  lane: { type: String, required: true },
  scenes: { type: Array, required: true },
  axis: { type: String, default: 'horizontal' },
  reactSwipeCommit: { type: Boolean, default: false }
})

const carouselEl = ref(null)
// const laneSize = ref(0)

const horizontal = computed(() => props.axis === 'horizontal')
const laneState = computed(() => state.get('carousel', props.lane))
/* -------------------------
   State syncing
-------------------------- */

watchEffect(() => {
  state.setCount('carousel', props.lane, props.scenes.length)
})
/* -------------------------
   Lane sizing (EXTRACTED)
-------------------------- */
const { laneSize } = useLaneSizing({
  elRef: carouselEl,
  axisRef: computed(() => props.axis),
  swipeType: 'carousel',
  laneId: computed(() => props.lane)
})
/* -------------------------
   Gesture forwarding (EXTRACTED)
-------------------------- */
usePointerForwarding({
  elRef: carouselEl,
  onReaction: handleReaction
})
/* -------------------------
   Reaction handling
-------------------------- */
function handleReaction(e) {
  if (!props.reactSwipeCommit) return
  if (e.detail?.type !== 'swipeCommit') return
  emit('swipeCommit', e.detail)
}


/* -------------------------
   Scene indexes
-------------------------- */
const totalScenes = computed(() => props.scenes.length)
const index = computed(() => laneState.value.index)

const safeScenes = computed(() => props.scenes.map(s => markRaw(s)))
const currentScene = computed(() => safeScenes.value[index.value] || null)

const prevScene = computed(() => {
  if (!totalScenes.value) return null
  const prevIdx = (index.value - 1 + totalScenes.value) % totalScenes.value
  return safeScenes.value[prevIdx] || null
})

const nextScene = computed(() => {
  if (!totalScenes.value) return null
  const nextIdx = (index.value + 1) % totalScenes.value
  return safeScenes.value[nextIdx] || null
})

/* -------------------------
   Movement math
-------------------------- */

const delta = computed(() => laneState.value.offset || 0)
const isDragging = computed(() => laneState.value.dragging)

// CSS transition: none during drag, eased during animation
const transition = computed(() => {
  if (isDragging.value) return 'none'
  return `transform ${APP_SETTINGS.swipeAnimationMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
})

// Use translate3d for GPU acceleration
const translate = (v) => horizontal.value
  ? `translate3d(${v}px, 0, 0)`
  : `translate3d(0, ${v}px, 0)`

const baseStyle = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  willChange: 'transform'
}

const currentStyle = computed(() => ({
  ...baseStyle,
  transform: translate(delta.value),
  transition: transition.value
}))

const prevStyle = computed(() => ({
  ...baseStyle,
  transform: translate(-laneSize.value + delta.value),
  transition: transition.value
}))

const nextStyle = computed(() => ({
  ...baseStyle,
  transform: translate(laneSize.value + delta.value),
  transition: transition.value
}))

const carouselStyle = computed(() => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  touchAction: 'none',
  transform: 'translateZ(0)'
}))

/* -------------------------
   Commit after transition
-------------------------- */
function onTransitionEnd(e) {
  if (e.propertyName !== 'transform') return
  state.setPosition('carousel', props.lane)
}
</script>

<style scoped>
.carousel {
  touch-action: none;
  /* GPU compositing hints */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.scene {
  user-select: none;
  /* Prevent layout thrashing */
  contain: layout style paint;
}
</style>
