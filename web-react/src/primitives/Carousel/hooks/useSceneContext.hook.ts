import type { Axis1D } from '../../../shared/types/core.types';
import { createContext, useContext } from 'react';

export interface SceneContextValue {
  sceneIdx: number
  laneId: string
  sceneId: string
  axis: Axis1D
  laneCount: number
  sceneCount: number
}

export const SceneContext = createContext<SceneContextValue>({
  sceneIdx: -1,
  laneId: '',
  sceneId: '',
  axis: "horizontal",
  laneCount: 0,
  sceneCount: 0
})

export function useSceneContext() {
  return useContext(SceneContext)
}