import Carousel from "@carousel/Carousel.tsx";
import { scenes } from "@indexes/laneIndex.tsx"
export default function LaneWallpaper() {

  return (
    <div className="wallpaper-layer">
      <Carousel
        className="interactive"
        id="wallpaper"
        scenes={scenes}
        axis="vertical"
        // interactive={false}
      ></Carousel>
    </div>
  )
}