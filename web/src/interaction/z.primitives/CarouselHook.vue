<template>
  <div class="carousel-default" :style="carouselStyle">
    <!-- Keyed v-for mirrors Carousel.vue: preserves scene instances across index changes -->
    <div
      v-for="entry in styledScenes"
      :key="entry.sceneIndex"
      class="scene-default"
      :style="entry.style">
      <component :is="entry.component" />
    </div>
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

const { visibleScenes } =
  useCarouselScenes({
    scenes: computed(() => props.scenes),
    laneState
  })

const { styleForRole, carouselStyle } =
  useCarouselMotion({
    laneState,
    laneSize,
    horizontal,
    id: props.sourceId
  })

const roleStyles = {
  prev: styleForRole('prev'),
  current: styleForRole('current'),
  next: styleForRole('next')
}
const styledScenes = computed(() =>
  visibleScenes.value.map(entry => ({
    ...entry,
    style: roleStyles[entry.role].value
  }))
)
</script>
