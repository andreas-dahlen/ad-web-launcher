// import MirrorCarousel from "@carousel/MirrorWrapper.tsx"
import Carousel from "@components/primitives/carousel/Carousel.tsx"
import {wpMirror, topMirror, midMirror, bottomMirror} from "@indexes/laneIndex"

export default function InteractiveLayer() {

  return (
    <div className="interactive-layer">
      <Carousel
        id="top-horizontal"
        scenes={topMirror}
        axis="horizontal"
        interactive={false}
      ></Carousel>

      <Carousel
        id="middle-horizontal"
        scenes={midMirror}
        axis="horizontal"
        interactive={false}
      ></Carousel>

      <Carousel
        id="bottom-horizontal"
        scenes={bottomMirror}
        axis="horizontal"
        interactive={false}
      ></Carousel>

    <div className="interactive-layer"> 
      <Carousel
        id="wallpaper"
        scenes={wpMirror}
        axis="vertical"
        interactive={false}
      ></Carousel>
    </div>


    </div>
  )
}