<template>
  <div class="scene-root a">
  </div>
</template>

<script setup>
defineOptions({ name: 'EmptyLane' })
</script>

<style scoped>
.a {
  opacity: 50%;
  background: linear-gradient(135deg, #ff01d5, #05fa4e);
  border: 4px, solid, black;
  pointer-events: none;
}
</style>
