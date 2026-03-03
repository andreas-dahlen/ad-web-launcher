<template>
  <div class="scene-root c">
    <SwipeLane
        v-if="!USER_SETTINGS.dragLock"
      type="drag"
      class="relative-max-size"
      lane="wall-drag1"
      axis="both"
      :snapX="snappingX"
      :snapY="snappingY"
      :reactSwipeCommit="true"
      >

      <template #drag-content>
        <div class="button-base move-col">Drag me</div>
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
</style>