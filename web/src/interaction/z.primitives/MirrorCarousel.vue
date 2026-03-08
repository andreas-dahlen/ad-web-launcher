<template>
  <div class="carousel-default" :style="carouselStyle">
    <component
      v-if="totalScenes > 0"
      :key="'p-' + prevIndex"
      :is="prevScene"
      class="scene-default"
      :style="prevStyle" />

    <component
      v-if="totalScenes > 0"
      :key="'c-' + index"
      :is="currentScene"
      class="scene-default"
      :style="currentStyle" />

    <component
      v-if="totalScenes > 0"
      :key="'n-' + nextIndex"
      :is="nextScene"
      class="scene-default"
      :style="nextStyle" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { state } from '../state/stateManager'
import { useCarouselMotion } from './composables/useLaneMotion'
import { useCarouselScenes } from './composables/useLaneScenes'

const props = defineProps({
  sourceId: { type: String, required: true },
  scenes: { type: Array, required: true },
  axis: { type: String, default: 'horizontal' }
})

const horizontal = computed(() => props.axis === 'horizontal')
const laneState = state.get('carousel', props.sourceId)

const laneSize = computed(() => {
  const size = laneState?.size
  if (!size) return 0
  return horizontal.value ? size.x : size.y
})

const { totalScenes, index, currentScene, prevScene, nextScene } =
  useCarouselScenes({
    scenes: computed(() => props.scenes),
    laneState
  })

const prevIndex = computed(() => {
  const t = totalScenes.value
  return t > 0 ? (index.value - 1 + t) % t : 0
})
const nextIndex = computed(() => {
  const t = totalScenes.value
  return t > 0 ? (index.value + 1) % t : 0
})

const { currentStyle, prevStyle, nextStyle, carouselStyle } =
  useCarouselMotion({
    laneState,
    laneSize,
    horizontal,
    id: props.sourceId
  })
</script>
