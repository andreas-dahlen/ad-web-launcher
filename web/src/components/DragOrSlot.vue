<template>
  <div class="scene-root c">
    <SwipeLane
      v-if="!USER_SETTINGS.dragLock"
      type="drag"
      class="drag-container"
      :lane="lane"
      axis="both"
      :snapX="snappingX"
      :snapY="snappingY"
      :reactSwipeCommit="true"
    >
      <!-- Slot for whatever you want inside SwipeLane -->
       <template #drag-content>
           <slot name="drag-content" />
       </template>
    </SwipeLane>

    <!-- Slot for fallback when drag is locked -->
    <slot v-else name="fallback" />
  </div>
</template>

<script setup>
import { USER_SETTINGS } from '../config/appSettings';
import SwipeLane from '../lanes/SwipeLane.vue'
import { computed } from 'vue';

defineOptions({ name: 'DragOrSlot' });

defineProps({
    lane: { type: String, required: true }
});

const snappingX = computed(() => USER_SETTINGS.defaultSnapX);
const snappingY = computed(() => USER_SETTINGS.defaultSnapY);
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
</style>





