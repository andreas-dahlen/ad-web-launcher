<template>
  <div class="scene-root c">
    <SwipeDrag
      class="drag-container"
      lane="wall-drag"
      axis="both"
      :snapX="snappingX"
      :snapY="snappingY"
      :reactSwipeCommit="true"
      >
      <div class="drag-content">Drag me</div>
    </SwipeDrag>
  </div>
</template>

<script setup>
import SwipeDrag from '../../../components/SwipeDrag.vue'
defineOptions({ name: 'WallD' })

const snappingX = "4"
const snappingY = "4"

</script>

<style scoped>
.c {
    background: linear-gradient(135deg, #ffffff, #000000);
}
.drag-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.drag-content {
  width: 130px;
  height: 130px;
  border-radius: 16px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #0b1b2b;
  background: linear-gradient(135deg, #ffe28a, #ff9f68);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  z-index: 100;
}
</style>