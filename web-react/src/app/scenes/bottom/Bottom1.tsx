// import { useCarouselStore } from '@components/primitives/carousel/hooks/useCarouselStore';
// import { useSceneContext } from '@components/primitives/carousel/hooks/useSceneContext';
import Slider from '../../../primitives/slider/Slider'

export default function Bottom1() {
  // const { sceneIndex, carouselId } = useSceneContext()
  // const { index } = useCarouselStore(carouselId)
  return (
    <div>
      <Slider
        id='bottom-slider-test'
        axis='horizontal'
      // className=
      // trackStyle=''
      >

        {/* <div className='slider-preset'></div> */}
      </Slider>
    </div>
  )
}