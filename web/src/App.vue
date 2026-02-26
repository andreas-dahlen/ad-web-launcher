<!-- App.vue -->
<template>
    <DebugWrapper v-if="APP_SETTINGS.DebugWrapper">
          <DebugPanel v-if="APP_SETTINGS.DebugWrapper"/>
      <Root />
    </DebugWrapper>
    <Root v-else />
</template>

<script setup>
import DebugPanel from './debug/DebugPanel.vue'
import { APP_SETTINGS } from './config/appSettings'
import DebugWrapper from './debug/DebugWrapper.vue'
import Root from './scenes/Root.vue'
</script>