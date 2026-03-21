import Carousel from "@carousel/Carousel.tsx";
import { scenes } from "@indexes/laneIndex.ts"

export default function LaneWallpaper() {

  return (
    <div className="wallpaper-layer">
      <Carousel
        className="interactive"
        id="wallpaper"
        scenes={scenes}
        axis="vertical"
      ></Carousel>
    </div>
  )
}