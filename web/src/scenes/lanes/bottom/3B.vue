<template>
  <div class="scene-root b">
    <SwipeSlider
      class="swipe-slider"
      lane="slider2"
      axis="vertical"
      :reactSwipeStart="true"
      :reactSwipe="true"
    >
      <div class="slider-content">..</div>
    </SwipeSlider>
  </div>
</template>

<script setup>
import SwipeSlider from '../../../components/SwipeSlider.vue'

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
