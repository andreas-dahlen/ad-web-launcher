import Carousel from "@carousel/Carousel.tsx";
import { wallPapper } from '../indexes/laneIndex';
import { useWallpaperStore } from '@scenes/wallpapers/useWallpaperStore';
import type { CtxCarousel } from '@typeScript/descriptor/ctxType';
export default function WallpaperLayer() {
  const { replaceStale } = useWallpaperStore()

  return (
    <div className="layer">
      <Carousel
        id="wallpaper"
        scenes={wallPapper}
        axis="vertical"
        onSwipeCommit={(detail) => {
          const dir = (detail as CtxCarousel).direction?.dir
          setTimeout(() => {
            if (dir === 'up') replaceStale('next')
            if (dir === 'down') replaceStale('prev')
          }, 200)
        }}
      />
    </div>
  )
}