import Carousel from "../components/primitives/carousel";
import { LANES } from "./laneIndex";

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