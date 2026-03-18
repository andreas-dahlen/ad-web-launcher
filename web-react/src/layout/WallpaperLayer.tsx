import Carousel from "@components/Carousel.tsx";
import wp1 from "../lanes/testLanes/wp1"
import wp2 from "../lanes/testLanes/wp2";
import wp3 from "../lanes/testLanes/wp3";

export default function LaneWallpaper() {

  const scenes = [wp1, wp2, wp3]
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