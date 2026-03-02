<template>
    <DragOrSlot lane="mid3-button-1">
      <template #drag-content>
        <div class="drag-content">Drag me</div>
      </template>
      
      <template #fallback>
        <div class="fallback">fallback</div>
      </template>
    </DragOrSlot>
</template>

<script setup>
import DragOrSlot from '../../components/DragOrSlot.vue';
defineOptions({ name: 'MidMir3' })
</script>

<style scoped>
.c {
opacity: 100%;
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
