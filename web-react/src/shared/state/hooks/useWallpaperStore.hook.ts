
import { wallpaperStore } from '@stores/wallpaper.store'
import { useEffect } from 'react'

export const useWallpaperStore = () => {

  useEffect(() => {
    wallpaperStore.getState().init()
    return () => {
      // wallpaperStore.getState().delete()
    } //TODO add delete?
  }, [])

  return wallpaperStore(
    s => s.wallpapers
  )
}