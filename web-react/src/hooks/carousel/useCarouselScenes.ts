import { useMemo } from "react"

type SceneRole = "prev" | "current" | "next"

interface VisibleScene<TProps> {
  sceneIndex: number
  component: React.ComponentType<TProps>
  role: SceneRole
}

interface UseCarouselScenesProps<TProps> {
  scenes: React.ComponentType<TProps>[]
  laneState: {
    index: number
  }
}

export function useCarouselScenes<TProps = object>({
  scenes,
  laneState
}: UseCarouselScenesProps<TProps>) {

  const totalScenes = scenes.length ?? 3
  const index = laneState.index ?? 0

  const visibleScenes = useMemo<VisibleScene<TProps>[]>(() => {

    if (!totalScenes) return []

    const prevIdx = (index - 1 + totalScenes) % totalScenes
    const nextIdx = (index + 1) % totalScenes

    return [
      { sceneIndex: prevIdx, component: scenes[prevIdx], role: "prev" },
      { sceneIndex: index, component: scenes[index], role: "current" },
      { sceneIndex: nextIdx, component: scenes[nextIdx], role: "next" }
    ]

  }, [scenes, totalScenes, index])

  return { totalScenes, index, visibleScenes }
}