import { Z } from '@config/zIndex';
import { baseComp } from '../compositions/laneComps';
// import useRuntimeBindings from '../compositions/useRuntimeBindings.hook';
import layerCss from './Layers.module.css'
import InputCarousel from '@primitives/carousel/InputCarousel';

//Layer 1/3 scenes read inputs here!
export default function BaseLayer() {
  // const { runtimeBindings } = useRuntimeBindings()
  return (
    <div className={layerCss.layer} style={{ zIndex: Z.base }}>
      {baseComp.map(comp => {
        const oneCarousel = (
          <InputCarousel
            // {...runtimeBindings[comp.id]}
            {...comp}
            key={comp.id}
          />
        )

        if (comp.renderLayer) {
          return (
            <div
              key={`${comp.id}-layer`}
              className={layerCss.layer}
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