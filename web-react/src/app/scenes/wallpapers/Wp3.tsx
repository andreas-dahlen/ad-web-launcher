import { useWallpaperStore } from './useWallpaperStore'

export default function Wp3() {
  const { wallpapers } = useWallpaperStore()
  const url = wallpapers[2]
  if (!url) return <div />
  return <div style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover' }} />
}