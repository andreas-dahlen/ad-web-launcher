import Carousel from "@carousel/Carousel.tsx";
import { wpScenes } from "../indexes/laneIndex.ts"

export default function WallpaperLayer() {

  return (
    <div className="wallpaper-layer">
      <Carousel
        id="wallpaper"
        scenes={wpScenes}
        axis="vertical"
      />
    </div>
  )
}