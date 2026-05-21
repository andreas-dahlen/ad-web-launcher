import { Z } from '@config/zIndex';
import { baseComp } from '../compositions/laneComps';
import Carousel from '@components/primitives/carousel/Carousel';
import useRuntimeBindings from '../compositions/useRuntimeBindings';

//Layer 1/3 scenes read inputs here!
export default function BaseLayer() {
  const { runtimeBindings } = useRuntimeBindings()
  return (
    <div className='layer base-layer' style={{ zIndex: Z.base }}>
      {baseComp.map(comp => {
        const oneCarousel = (
          <Carousel
            key={comp.id}
            {...comp}
            {...runtimeBindings[comp.id]}
          />
        )

        if (comp.renderLayer) {
          return (
            <div
              key={`${comp.id}-layer`}
              className="layer base-layer"
              style={{ zIndex: Z[comp.renderLayer] }}
            >
              {oneCarousel}
            </div>
          )
        }

        return oneCarousel
      })}
    </div>
  )
}