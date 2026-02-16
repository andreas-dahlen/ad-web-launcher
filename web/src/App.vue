<!-- App.vue -->
<template>
  <div id="app">
    <DebugWrapper v-if="APP_SETTINGS.DebugWrapper">
          <DebugPanel v-if="APP_SETTINGS.DebugWrapper"/>
      <Root />
    </DebugWrapper>
    <Root v-else />
  </div>
</template>

<script setup>
import DebugPanel from './components/DebugPanel.vue'
import { APP_SETTINGS } from './config/appSettings'
import DebugWrapper from './components/DebugWrapper.vue'
import Root from './scenes/Root.vue'
</script>