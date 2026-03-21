import Carousel from "@components/primitives/carousel/Carousel.tsx"
import { topScenes } from "@indexes/laneIndex.ts"
import { midScenes } from "@indexes/laneIndex.ts"
import { bottomScenes } from "@indexes/laneIndex.ts"

export default function LanesHorizontal() {
  return (
        <div className="carousel-layer">
          <Carousel
            className="interactive"
            id="top-horizontal"
            scenes={topScenes}
            axis="horizontal"
          ></Carousel>

          <Carousel
            className="interactive"
            id="middle-horizontal"
            scenes={midScenes}
            axis="horizontal"
          ></Carousel>

          <Carousel
            className="interactive"
            id="bottom-horizontal"
            scenes={bottomScenes}
            axis="horizontal"
          ></Carousel>
        </div>
  )
}