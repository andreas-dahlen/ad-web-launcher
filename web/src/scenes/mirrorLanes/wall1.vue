<template>
  <div class="scene-root c">
    <SwipeLane
        v-if="!USER_SETTINGS.dragLock"
      type="drag"
      class="drag-container"
      lane="wall-drag"
      axis="both"
      :snapX="snappingX"
      :snapY="snappingY"
      :reactSwipeCommit="true"
      >

      <template #drag-content>
        <div class="drag-content">Drag me</div>
      </template>
    </SwipeLane>

    <TestButton
    v-else 
    ></TestButton>
  </div>
</template>

<script setup>
import { USER_SETTINGS } from '../../config/appSettings';
import SwipeLane from '../../lanes/SwipeLane.vue'
import TestButton from '../../components/buttons/TestButton.vue';
import { computed } from 'vue';
defineOptions({ name: 'WallMir1' })

const snappingX = computed(() => USER_SETTINGS.defaultSnapX)
const snappingY = computed(() => USER_SETTINGS.defaultSnapY)

</script>

<style scoped>
.c {
    opacity: 100%;
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