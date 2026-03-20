export type SceneRole = "prev" | "current" | "next"

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

  const prevIdx = (index - 1 + totalScenes) % totalScenes
  const nextIdx = (index + 1) % totalScenes

  const scenesByRole: Record<SceneRole, React.ComponentType<TProps>> = {
    prev: scenes[prevIdx],
    current: scenes[index],
    next: scenes[nextIdx]
  }

  return { totalScenes, index, scenesByRole }
}