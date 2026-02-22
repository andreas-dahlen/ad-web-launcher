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

const emit = defineEmits(['swipe'])

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
  const pos = ratio * laneSize.value + laneOffset.value

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
/* .thumb-inner.horizontal {
  justify-content: center;
  align-items: flex-start;
  }
  
  .thumb-inner.vertical {
  justify-content: flex-start;
  align-items: center;
} */

.slider-container {
  position: relative;
  /* width: 100%;
  height: 100%; */
  background: #eee;
  overflow: hidden;
  touch-action: none;
}
.slider-container[data-axis="horizontal"] {
  display: flex;
  align-items: center;
}
.slider-container[data-axis="vertical"] {
  display: flex;
  justify-content: center;
}

.slider-track {
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.163);
  position: absolute;
}
.slider-container[data-axis="horizontal"] .slider-track {
  inset: 40% 5%;
}
.slider-container[data-axis="vertical"] .slider-track {
  inset: 5% 40%;
}

.thumbEl {
  position: absolute;
  top: 0;
  left: 0;
  /* width: 100%;
  height: 100%; */
  /* display: flex; */
  will-change: transform;
}

/* .slider-container[data-axis="horizontal"] .slider-thumb {
  height: 100%;
  align-items: center;
}

.slider-container[data-axis="vertical"] .slider-thumb {
  width: 100%;
  justify-content: center;
} */
</style>
