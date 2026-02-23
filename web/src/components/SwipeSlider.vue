<template>
  <div ref="sliderEl" 
  v-bind="$attrs" class="slider-container" 
  :data-lane="lane" 
  :data-axis="axis"
  data-swipe-type="slider" 
  :data-react-swipe="reactSwipe ? true : null"
  :data-react-swipe-start="reactSwipeStart ? true : null">
    <div class="slider-track"></div>
    <div ref="thumbEl" class="thumbEl" :style="thumbStyle">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { state } from '../interaction/state/stateManager'
import { useSliderSizing } from '../interaction/adapters/useSliderSizing'
import { usePointerForwarding } from '../interaction/bridge/bridge'

const emit = defineEmits(['volumeChange'])

defineOptions({ name: 'SwipeSlider' })

const props = defineProps({
  lane: { type: String, required: true },
  axis: { type: String, default: 'horizontal' },
  reactSwipe: { type: Boolean, default: false },
  reactSwipeStart: { type: Boolean, default: false },
})

/* -------------------------
   Refs / basics
-------------------------- */
const sliderEl = ref(null)
const thumbEl = ref(null)

const horizontal = computed(() => props.axis === 'horizontal')

/* -------------------------
   Slider state refs
-------------------------- */
const laneState = computed(() => state.get('slider', props.lane))
const laneOffset = computed(() => laneState.value?.offset ?? 0)
const dragging = computed(() => laneState.value?.dragging ?? false)
const lanePosition = computed(() => state.getPosition('slider', props.lane) ?? 0)
const laneConstraints = computed(() => state.getConstraints('slider', props.lane) ?? { min: 0, max: 100 })
const laneSize = computed(() => {
  const size = state.getSize('slider', props.lane)
  if (!size) return 0
  return horizontal.value ? size.x : size.y
})

const laneThumbSize = computed(() => {
  const size = state.getThumbSize('slider', props.lane)
  if (!size) return 0
  return horizontal.value ? size.x : size.y
})

/* -------------------------
Watch / ensure slider exists
-------------------------- */
watchEffect(() => state.ensure('slider', props.lane))
/* -------------------------
   Lane sizing
-------------------------- */
useSliderSizing({
  elRef: sliderEl,
  thumbRef: thumbEl,
  // axisRef: computed(() => props.axis),
  swipeType: 'slider',
  laneId: computed(() => props.lane)
})
/* -------------------------
   Gesture forwarding (EXTRACTED)
-------------------------- */
usePointerForwarding({
  elRef: sliderEl,
  onReaction: handleReaction
})
/* -------------------------
Reaction handling
-------------------------- */
function handleReaction(e) {
  const type = e.detail?.type
  if (!type) return
  if (type === 'swipe' && props.reactSwipe) { emit('volumeChange', e.detail) }
  if (type === 'swipeStart' && props.reactSwipeStart) { emit('volumeChange', e.detail) }
}
/* -------------------------
   Computed thumb style
-------------------------- */
const thumbStyle = computed(() => {
  // Map value to position
  const { min, max } = laneConstraints.value
  const value = lanePosition.value

  const range = max - min || 1

  const ratio = (value - min) / range
  // Use usable space (track - thumb), same coordinate space as solver
  const usable = Math.max(laneSize.value - laneThumbSize.value, 0)
  const pos = ratio * usable + laneOffset.value

  return {
    transform: horizontal.value
      ? `translate3d(${pos}px,0,0)`
      : `translate3d(0,${pos}px,0)`,
    transition: dragging.value ? 'none' : 'transform 150ms ease-out',
    willChange: 'transform'
  }
})
</script>

<style scoped>

.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #eee;
  /* overflow: hidden; */
  touch-action: none;
}

.slider-track {
  border-radius: 999px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.163);
  position: absolute;
}
.slider-container[data-axis="horizontal"] .slider-track {
  height: 10px;
  width: 90%;
  left: 5%;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
}
.slider-container[data-axis="vertical"] .slider-track {
  width: 10px;
  height: 90%;
  top: 5%;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
}

.thumbEl {
  will-change: transform;
}
/* Horizontal slider → center vertically */
.slider-container[data-axis="horizontal"] .thumbEl {
  display: flex;
  height: 100%;
  align-items: center;
}
/* Vertical slider → center horizontally */
.slider-container[data-axis="vertical"] .thumbEl {
    display: flex;
    width: 100%;
  justify-content: center;
}
</style>
