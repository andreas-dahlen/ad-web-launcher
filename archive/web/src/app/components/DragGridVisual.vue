<template>
  <div class="drag-grid" ref="gridEl" v-if="USER_SETTINGS.dragGridVisual">
    <!-- Vertical lines -->
    <div
      v-for="n in snapXPositions"
      :key="'v-' + n"
      class="grid-line vertical"
      :style="{ left: n + '%' }"
    ></div>

    <!-- Horizontal lines -->
    <div
      v-for="n in snapYPositions"
      :key="'h-' + n"
      class="grid-line horizontal"
      :style="{ top: n + '%' }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { USER_SETTINGS } from '../config/appSettings'

const gridEl = ref(null)

// Compute positions as percentages
const snapXPositions = computed(() => {
  const count = USER_SETTINGS.defaultSnapX
  if (!count || count <= 0) return []
  if (count === 1) return [50]
  const step = 100 / (count - 1)
  return Array.from({ length: count }, (_, i) => i * step)
})

const snapYPositions = computed(() => {
  const count = USER_SETTINGS.defaultSnapY
  if (!count || count <= 0) return []
  if (count === 1) return [50]
  const step = 100 / (count - 1)
  return Array.from({ length: count }, (_, i) => i * step)
})
</script>

<style scoped>
.drag-grid {
  position: absolute;
  inset: 0; /* fill parent */
  pointer-events: none;
  z-index: 5;
}

.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.2);
}

.grid-line.vertical {
  width: 2px;
  height: 100%;
  transform: translateX(-0.5px);
}

.grid-line.horizontal {
  height: 2px;
  width: 100%;
  transform: translateY(-0.5px);
}
</style>