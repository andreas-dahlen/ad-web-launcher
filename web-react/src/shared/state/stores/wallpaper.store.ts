
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { fetchWallpapers } from '@api/wallpaper.ts';
import type { SceneRole } from '../../types/core.types.ts';


export type WallpaperStore = {
  wallpapers: string[]
  pool: string[]
  init: () => void
  replaceStale: (direction: Exclude<SceneRole, 'current'>) => void
}

export const wallpaperStore = create<WallpaperStore>()(
  immer((set, get) => ({

    wallpapers: [],
    pool: [],

    init: async () => {
      if (get().wallpapers.length > 0) return
      try {
        const images = await fetchWallpapers()
        set(s => {
          s.pool = images
          s.wallpapers = images.slice(0, 3)
          // console.log('pool: ', s.pool)
        })
      } catch (error) {
        console.warn('Failed to fetch wallpapers', error)
        // later: set an error state, show fallback, etc.
      }
    },
    replaceStale: (direction) => {
      set(s => {
        // console.log('replaceStale', direction, 'wallpapers:', s.wallpapers, 'pool:', s.pool)
        const remaining = s.pool.filter(url => !s.wallpapers.includes(url))
        const pick = remaining[Math.floor(Math.random() * remaining.length)]
        if (!pick) return
        // swiped next → prev slot is stale (index 0)
        // swiped prev → next slot is stale (index 2)
        const staleIdx = direction === 'next' ? 0 : 2
        s.wallpapers[staleIdx] = pick
      })
    }
  }))
) 