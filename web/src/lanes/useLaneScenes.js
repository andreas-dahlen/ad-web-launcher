import { computed, markRaw } from 'vue'

/* -------------------------
   Carousel scene index resolution
   - wrapping prev/current/next
   - markRaw to avoid Vue reactivity on components
-------------------------- */
export function useCarouselScenes({ scenes, laneState }) {
  const totalScenes = computed(() => scenes.value.length)
  const index = computed(() => laneState.index)

  const safeScenes = computed(() => scenes.value.map(s => markRaw(s)))
  const currentScene = computed(() => safeScenes.value[index.value] || null)

  const prevScene = computed(() => {
    if (!totalScenes.value) return null
    const prevIdx = (index.value - 1 + totalScenes.value) % totalScenes.value
    return safeScenes.value[prevIdx] || null
  })

  const nextScene = computed(() => {
    if (!totalScenes.value) return null
    const nextIdx = (index.value + 1) % totalScenes.value
    return safeScenes.value[nextIdx] || null
  })

  return { totalScenes, index, currentScene, prevScene, nextScene }
}
