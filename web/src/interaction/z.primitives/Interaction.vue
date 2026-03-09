<template>
  <component :is="primitive" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]>
      <slot :name="name" />
    </template>
  </component>
</template>

<script setup>
import Carousel from './Carousel.vue'
import Slider from './Slider.vue'
import Drag from './Drag.vue'
import Button from './Button.vue'

import { computed } from 'vue'

const props = defineProps({
  type: { type: String, required: true }
})

const primitives = {
  carousel: Carousel,
  slider: Slider,
  drag: Drag,
  button: Button
}

const primitive = computed(() => {
  const p = primitives[props.type]

  if (!p) {
    console.warn(`Unknown interaction type: ${props.type}`)
  }

  return p
})
</script>
