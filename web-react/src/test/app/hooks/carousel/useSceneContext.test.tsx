import { SceneContext, useSceneContext, type SceneContextValue } from '@primitives/Carousel/hooks/useSceneContext.hook'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'



describe('[USE SCENE CONTEXT]', () => {
  it('returns the default context value without a provider', () => {
    const { result } = renderHook(() => useSceneContext())

    expect(result.current).toEqual({
      sceneIdx: -1,
      laneId: '',
      sceneId: '',
      axis: 'horizontal',
      laneCount: 0,
      sceneCount: 0
    })
  })

  it('returns the provided scene context', () => {
    const context: SceneContextValue = {
      sceneIdx: 2,
      laneId: 'lane-1',
      sceneId: 'scene-2',
      axis: 'vertical',
      laneCount: 3,
      sceneCount: 5
    }

    const { result } = renderHook(
      () => useSceneContext(),
      {
        wrapper: ({ children }) => (
          <SceneContext.Provider value= { context } >
          { children }
          </SceneContext.Provider>
        )
  }
  )

  expect(result.current).toEqual(context)
})
})