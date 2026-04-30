import Carousel from "@carousel/Carousel.tsx"
import { bottom, mid, top } from '../indexes/laneIndex'

export default function HorizontalLayer() {
  return (
    <div className="layer">
      <Carousel
        id="top-horizontal"
        axis="horizontal"
        sceneCount={top.length}
      />

      <Carousel
        id="middle-horizontal"
        axis="horizontal"
        sceneCount={mid.length}
      />

      <Carousel
        id="bottom-horizontal"
        axis="horizontal"
        sceneCount={bottom.length}
      />
    </div>
  )
}