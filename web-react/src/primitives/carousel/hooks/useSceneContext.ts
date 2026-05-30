import { createContext, useContext } from 'react';

interface SceneContextValue {
  sceneIndex: number
  carouselId: string
}

export const SceneContext = createContext<SceneContextValue>({
  sceneIndex: -1,
  carouselId: ''
})

export function useSceneContext() {
  return useContext(SceneContext)
}