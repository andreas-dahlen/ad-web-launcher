// import MirrorCarousel from "@carousel/MirrorWrapper.tsx"
import Carousel from "@components/primitives/carousel/Carousel"
import { wpMirror } from "@indexes/laneIndex"

export default function InteractiveLayer() {

  return (
    <div className="interactive-layer">


            <Carousel
              className="interactive"
              id="wallpaper"
              scenes={wpMirror}
              axis="vertical"
              interactive={false}
            ></Carousel>

      {/* <MirrorCarousel
        id="top-horizontal"
        axis="horizontal"
        renderLanes={[0]}
      >
        <div className='red-box'></div>
      </MirrorCarousel>

      <MirrorCarousel
        id="middle-horizontal"
        axis="horizontal"
        renderLanes={[1]}
      >
        <div className='blue-box'></div>
      </MirrorCarousel>

      <MirrorCarousel
        id="bottom-horizontal"
        axis="horizontal"
        renderLanes={[2]}
      >
        <div className='green-box'></div>
      </MirrorCarousel>


      <MirrorCarousel
        id="wallpaper"
        axis="vertical"
        renderLanes={[2]}
      >
        <div className='spin-box'></div>
      </MirrorCarousel> */}

    </div>
  )
}