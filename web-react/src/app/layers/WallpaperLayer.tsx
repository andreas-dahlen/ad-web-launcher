import Carousel from "@carousel/Carousel.tsx";
import { wpMirror } from "../indexes/laneIndex.ts"

export default function WallpaperLayer() {

  return (
    <div className="layer">
      <Carousel
        id="wallpaper"
        sceneCount={wpMirror.length}
        axis="vertical"
      />
    </div>
  )
}