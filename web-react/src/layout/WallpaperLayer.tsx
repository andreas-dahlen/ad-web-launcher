import Carousel from "@components/Carousel.tsx";
import { LANES } from "./laneIndex.ts";

export default function LaneWallpaper() {

  const scenes = LANES.wallpaper
  return (
    <div className="wallpaper-layer">
      <Carousel
        type="carousel"
        id="wallpaper"
        scenes={scenes}
        axis="vertical"
      ></Carousel>
    </div>
  )
}