import { layoutStore, type LaneSystem, type LayoutStore } from '@app/compositions/layout.store'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

export const layout_DEFAULTS = {
  vertical: {
    lanes: {
      wallpaper: {
        id: "wallpaper", axis: "vertical", scenes: [{ sceneId: "vertical" }]
      }
    },
    order: ["wallpaper"]
  } satisfies LaneSystem,
  horizontal: {
    lanes: {
      top: {
        id: "top", axis: "horizontal", scenes: [{ sceneId: "horizontal" }]
      }
    },
    order: ["top"]
  } satisfies LaneSystem
}

export const useLayoutStore = () => {

  useEffect(() => {
    layoutStore.getState().init(layout_DEFAULTS)
    return () => {
      // layoutStore.getState().delete()
    }
  }, [])

  return layoutStore(
    useShallow((s: LayoutStore) => ({
      vertical: s.vertical ?? layout_DEFAULTS.vertical,
      horizontal: s.horizontal ?? layout_DEFAULTS.horizontal
    }))
  ) //TODO remove useShallow?
}