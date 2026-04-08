<template>
  <div class="scene-root">
    <SwipeLane
      type="slider"
      class="swipe-slider"
      id="slider1"
      axis="horizontal"
      :reactSwipeStart="true"
      :reactSwipe="true"
    >

    <template #slider-track>
      <div class="track-content"></div>
    </template>

    <template #slider-content>
      <div class="slider-content">H</div>
    </template>
    </SwipeLane>
  </div>
</template>

<script setup>
import SwipeLane from '../../../interaction/z.primitives/Interaction.vue'

defineOptions({ name: 'MidMir2' })

</script>

<style scoped>
.swipe-slider {
  height: 21%;
  width: 300px;
  border-radius: 10px;
  background-color: rgba(255, 105, 180, 0.226);
  border: 1px, solid, black;
}

.track-content {
  width: 270px;
  height: 10px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 999px;
}

.slider-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  background: #4285f4;
  box-shadow: 0 0px 10px 0px black
}
</style>