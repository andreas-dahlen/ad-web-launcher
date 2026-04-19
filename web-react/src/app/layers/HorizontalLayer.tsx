import Carousel from "@carousel/Carousel.tsx"
import { bottomMirror, midMirror, topMirror } from '../indexes/laneIndex'

export default function HorizontalLayer() {
  return (
    <div className="layer">
      <Carousel
        id="top-horizontal"
        axis="horizontal"
        sceneCount={topMirror.length}
      />

      <Carousel
        id="middle-horizontal"
        axis="horizontal"
        sceneCount={midMirror.length}
      />

      <Carousel
        id="bottom-horizontal"
        axis="horizontal"
        sceneCount={bottomMirror.length}
      />
    </div>
  )
}