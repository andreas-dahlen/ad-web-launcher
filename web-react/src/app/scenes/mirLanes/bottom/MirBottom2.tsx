import Slider from '@components/primitives/slider/Slider';


export default function MirBottom2() {

  return (
    <div className="scene-root non-interactive">
      <Slider
        id='vertical-slider'
        axis='vertical'
      // className=
      // trackStyle='slider-track'
      >

        <div className='slider-base slider-col-2'></div>
      </Slider>
    </div>
  )
}