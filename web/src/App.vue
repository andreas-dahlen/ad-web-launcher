<!-- App.vue -->
<template>
    <DebugWrapper v-if="APP_SETTINGS.DebugWrapper">
          <DebugPanel v-if="APP_SETTINGS.DebugWrapper"/>
      <Root />
    </DebugWrapper>
    <Root v-else />
</template>

<script setup>
import DebugPanel from './app/debug/DebugPanel.vue'
import { APP_SETTINGS } from './app/config/appSettings'
import DebugWrapper from './app/debug/DebugWrapper.vue'
import Root from './app/scenes/Root.vue'
</script>