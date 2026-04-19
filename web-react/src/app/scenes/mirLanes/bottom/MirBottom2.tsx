import Slider from '@slider/Slider.tsx';


export default function MirBottom2() {

  return (
    <div>
      <Slider
        id='vertical-slider'
        axis='vertical'
      // className=
      // trackStyle='slider-track'
      >

        <div className='slider-preset slider-col-2'></div>
      </Slider>
    </div>
  )
}