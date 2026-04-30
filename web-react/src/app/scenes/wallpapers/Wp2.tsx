import { useWallpaperStore } from './useWallpaperStore'

export default function Wp2() {
  const { wallpapers } = useWallpaperStore()
  const url = wallpapers[1]
  if (!url) return <div />
  return <div style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover' }} />
}