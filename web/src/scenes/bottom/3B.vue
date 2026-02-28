<template>
  <div class="scene-root b">
    <SwipeLane
      type="slider"
      class="swipe-slider"
      lane="slider2"
      axis="vertical"
      :reactSwipeStart="true"
      :reactSwipe="true"
    >
      <div class="slider-content">..</div>
    </SwipeLane>
  </div>
</template>

<script setup>
import SwipeLane from '../../lanes/SwipeLane.vue'

defineOptions({ name: 'bottomB' })

</script>

<style scoped>
.b {
  background: linear-gradient(135deg, #7aa2ff, #47c6ff);
}
.swipe-slider {
  height: 90%;
  width: 30%;
}

.slider-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  color: white;
  font-weight: bold;
    background: #4285f4;
  border-radius: 10px;
}
</style>
