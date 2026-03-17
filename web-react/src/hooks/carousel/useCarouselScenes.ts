import { useMemo } from "react"

type SceneRole = "prev" | "current" | "next"

interface VisibleScene {
  sceneIndex: number
  component: React.ComponentType
  role: SceneRole
}

interface UseCarouselScenesProps {
  scenes: React.ComponentType[]
  laneState: {
    index: number
  }
}

export function useCarouselScenes({
  scenes,
  laneState
}: UseCarouselScenesProps) {

  const totalScenes = scenes.length
  const index = laneState.index

  const visibleScenes = useMemo<VisibleScene[]>(() => {

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