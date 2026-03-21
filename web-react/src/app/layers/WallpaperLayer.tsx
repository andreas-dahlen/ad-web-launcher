import Carousel from "@carousel/Carousel.tsx";
import { wpScenes } from "@indexes/laneIndex.ts"

export default function LaneWallpaper() {

  return (
    <div className="wallpaper-layer">
      <Carousel
        className="interactive"
        id="wallpaper"
        scenes={wpScenes}
        axis="vertical"
      ></Carousel>
    </div>
  )
}