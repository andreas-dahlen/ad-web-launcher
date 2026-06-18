import { createContext, useContext } from 'react';

interface SceneContextValue {
  sceneIdx: number
  carouselId: string
}

export const SceneContext = createContext<SceneContextValue>({
  sceneIdx: -1,
  carouselId: ''
})

export function useSceneContext() {
  return useContext(SceneContext)
}