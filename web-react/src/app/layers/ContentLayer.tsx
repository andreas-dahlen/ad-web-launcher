import Carousel from "@carousel/Carousel.tsx"
import { vertical, top, mid, bottom } from "../indexes/laneIndex.ts"

export default function ContentLayer() {

  return (
    <div className="layer">
      <Carousel
        id="top-horizontal"
        scenes={top}
        axis="horizontal"
        interactive={false}
      />

      <Carousel
        id="middle-horizontal"
        scenes={mid}
        axis="horizontal"
        interactive={false}
      />

      <Carousel
        id="bottom-horizontal"
        scenes={bottom}
        axis="horizontal"
        interactive={false}
      />

      <div className="layer">
        <Carousel
          id="wallpaper"
          scenes={vertical}
          axis="vertical"
          interactive={false}
        />
      </div>
    </div>
  )
}