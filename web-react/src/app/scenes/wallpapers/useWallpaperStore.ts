import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { wallpaperStore, type WallpaperStore } from '../../../stores/wallpaperStore.ts'

export const useWallpaperStore = () => {

  useEffect(() => {
    wallpaperStore.getState().init()
    return () => {
      // wallpaperStore.getState().delete()
    }
  }, [])

  return wallpaperStore(
    useShallow((s: WallpaperStore) => ({
      wallpapers: s.wallpapers,
      replaceStale: s.replaceStale
    }))
  )
}