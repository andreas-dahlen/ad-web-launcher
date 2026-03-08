<template>
  <div class="scene-root">
      <SwipeLane
          v-if="!USER_SETTINGS.dragLock"
        type="drag"
        class="relative-max-size"
        id="wall-drag1"
        axis="both"
        :data-locked="false"
        :snapX="snappingX"
        :snapY="snappingY"
        :reactSwipeCommit="true"
        >
  
        <template #drag-content>
          <div class="button-base move-col">Drag me</div>
          <TestButton v-if="USER_SETTINGS.dragLock"></TestButton>
        </template>
      </SwipeLane>
    </div>
</template>

<script setup>
import { USER_SETTINGS } from '../../config/appSettings';
import SwipeLane from '../../../interaction/z.primitives/SwipeLane.vue'
import TestButton from '../../components/buttons/TestButton.vue';
import { computed } from 'vue';
defineOptions({ name: 'WallMir1' })

const snappingX = computed(() => USER_SETTINGS.defaultSnapX)
const snappingY = computed(() => USER_SETTINGS.defaultSnapY)

</script>

<style scoped>

.button-wrapper {
  width: 20px;
  height: 20px;
}
</style>