import Carousel from "@carousel/Carousel.tsx"
import { topScenes, midScenes, bottomScenes } from "../indexes/laneIndex.ts"

export default function HorizontalLayer() {
  return (
    <div className="carousel-layer">
      <Carousel
        id="top-horizontal"
        scenes={topScenes}
        axis="horizontal"
      />

      <Carousel
        id="middle-horizontal"
        scenes={midScenes}
        axis="horizontal"
      />

      <Carousel
        id="bottom-horizontal"
        scenes={bottomScenes}
        axis="horizontal"
      />
    </div>
  )
}