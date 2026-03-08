<template>
  <div class="scene-root">
    <SwipeLane
      v-if="!USER_SETTINGS.dragLock"
      type="drag"
      :id="id"
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
import SwipeLane from '../../interaction/z.primitives/SwipeLane.vue'
import { computed } from 'vue';

defineOptions({ name: 'DragOrSlot' });

defineProps({
    id: { type: String, required: true }
});

const snappingX = computed(() => USER_SETTINGS.defaultSnapX);
const snappingY = computed(() => USER_SETTINGS.defaultSnapY);
</script>

<style scoped>
</style>





