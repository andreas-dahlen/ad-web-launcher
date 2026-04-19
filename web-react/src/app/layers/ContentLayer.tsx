import Carousel from "@carousel/Carousel.tsx"
import { wpMirror, topMirror, midMirror, bottomMirror } from "../indexes/laneIndex.ts"

export default function ContentLayer() {

  return (
    <div className="layer">
      <Carousel
        id="top-horizontal"
        scenes={topMirror}
        axis="horizontal"
        interactive={false}
      />

      <Carousel
        id="middle-horizontal"
        scenes={midMirror}
        axis="horizontal"
        interactive={false}
      />

      <Carousel
        id="bottom-horizontal"
        scenes={bottomMirror}
        axis="horizontal"
        interactive={false}
      />

      <div className="layer">
        <Carousel
          id="wallpaper"
          scenes={wpMirror}
          axis="vertical"
          interactive={false}
        />
      </div>
    </div>
  )
}