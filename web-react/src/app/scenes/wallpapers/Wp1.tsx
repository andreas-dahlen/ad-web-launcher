import { useWallpaperStore } from './useWallpaperStore'

export default function Wp1() {
  const { wallpapers } = useWallpaperStore()
  const url = wallpapers[0]
  if (!url) return <div />
  return (
    <div style={{ backgroundImage: `url(${url})` }} className='wallpaper' />
  )
}