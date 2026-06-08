import { computed, markRaw } from 'vue'

/* -------------------------
   Carousel scene index resolution
   - Returns a visibleScenes array keyed by sceneIndex
   - Using v-for :key="entry.sceneIndex" prevents Vue from
     unmounting/remounting scenes when the index changes,
     preserving internal component state and animations.
   - markRaw prevents Vue from deep-reactifying component objects
-------------------------- */
export function useCarouselScenes({ scenes, laneState }) {
  const totalScenes = computed(() => scenes.value.length)
  const index = computed(() => laneState.index)

  const safeScenes = computed(() => scenes.value.map(s => markRaw(s)))

  const visibleScenes = computed(() => {
    const total = totalScenes.value
    if (!total) return []
    const i = index.value
    const prevIdx = (i - 1 + total) % total
    const nextIdx = (i + 1) % total
    return [
      { sceneIndex: prevIdx, component: safeScenes.value[prevIdx], role: 'prev' },
      { sceneIndex: i,       component: safeScenes.value[i],       role: 'current' },
      { sceneIndex: nextIdx, component: safeScenes.value[nextIdx], role: 'next' }
    ]
  })

  return { totalScenes, index, visibleScenes }
}
