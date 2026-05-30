
import { wallpaperStore, type WallpaperStore } from '@stores/wallpaperStore'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

export const useWallpaperStore = () => {

  useEffect(() => {
    wallpaperStore.getState().init()
    return () => {
      // wallpaperStore.getState().delete()
    } //TODO add delete?
  }, [])

  return wallpaperStore(
    useShallow((s: WallpaperStore) => ({
      wallpapers: s.wallpapers,
      replaceStale: s.replaceStale
    }))
  )
}