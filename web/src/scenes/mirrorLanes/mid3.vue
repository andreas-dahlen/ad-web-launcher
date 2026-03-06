<template>
  <div class="scene-root">
    <DragOrSlot lane="mid3-button-1">
      <template #drag-content>
        <div class="button-base move-col">Drag me</div>
      </template>
      
      <template #fallback>
        <TestButton class="button-base locked-col">locked</TestButton>
      </template>
    </DragOrSlot>
  </div>  
</template>

<script setup>
import TestButton from '../../components/buttons/TestButton.vue';
import DragOrSlot from '../../components/DragOrSlot.vue';
defineOptions({ name: 'MidMir3' })
</script>

<style scoped>
</style>
