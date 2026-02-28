<template>
  <div class="scene-root b">
    <SwipeLane
      type="slider"
      class="swipe-slider"
      lane="slider1"
      axis="horizontal"
      :reactSwipeStart="true"
      :reactSwipe="true"
    >
      <div class="slider-content">..</div>
    </SwipeLane>
  </div>
</template>

<script setup>
import SwipeLane from '../../lanes/SwipeLane.vue'

defineOptions({ name: 'MidB' })

</script>

<style scoped>
.b {
  background: linear-gradient(135deg, #7aa2ff, #47c6ff);
}
.swipe-slider {
  height: 30%;
  width: 90%;
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
}
</style>