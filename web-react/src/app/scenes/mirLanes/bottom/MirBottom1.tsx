import Slider from '@slider/Slider.tsx';

export default function MirBottom1() {

    return (
        <div className="scene-root non-interactive">
            <Slider
                id='bottom-slider-test'
                axis='horizontal'
            // className=
            // trackStyle='slider-track'
            >

                <div className='slider-base slider-col-2'></div>
            </Slider>
        </div>
    )
}