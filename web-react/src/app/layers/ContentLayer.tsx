import Carousel from '../../primitives/carousel/Carousel.tsx'
import DragGrid from '@features/dragGrid/DragGrid.tsx'
import { Z } from '@config/zIndex.ts'
import { contentComp } from '../compositions/laneComps.ts'
import layerCss from './Layers.module.css'
/** LAYER 2/3! Interactive=false carousel. Contents are mounted inside!
 * The carousel swipes are handled by baseLayer. */
export default function ContentLayer() {
  return (
    <div className={layerCss.layer} style={{ zIndex: Z.content }}>
      {contentComp.map(comp => {
        const oneCarousel = (
          < Carousel
            {...comp}
            key={`${comp.id}-carousel`}
          />
        )

        if (comp.renderLayer) {
          return (
            <div
              key={`${comp.id}-content`}
              className={layerCss.layer}
              style={{ zIndex: Z[comp.renderLayer] }}
            >
              {oneCarousel}
            </div>
          )
        }
        return oneCarousel
      })}
      <DragGrid />
      <div id="drag-slot" />
    </div>
  )
}