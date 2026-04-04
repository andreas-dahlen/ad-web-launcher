import Carousel from "@components/primitives/carousel/Carousel.tsx"
import { topScenes, midScenes, bottomScenes } from "@indexes/laneIndex.ts"

export default function HorizontalLayer() {
  return (
    <div className="carousel-layer">
      <Carousel
        className="interactive"
        id="top-horizontal"
        scenes={topScenes}
        axis="horizontal"
      />

      <Carousel
        className="interactive"
        id="middle-horizontal"
        scenes={midScenes}
        axis="horizontal"
      />

      <Carousel
        className="interactive"
        id="bottom-horizontal"
        scenes={bottomScenes}
        axis="horizontal"
      />
    </div>
  )
}