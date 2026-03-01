<template>
  <div class="scene-root">
    <AppSettingsPanel/>
    bottom mirror 1
  </div>
</template>

<script setup>
defineOptions({ name: 'BottomMir1' })

import AppSettingsPanel from '../../config/AppSettingsPanel.vue';
</script>

<style scoped>
.a {
  opacity: 100;
pointer-events: none;
}
</style>
