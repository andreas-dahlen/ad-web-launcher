import Carousel from "@carousel/Carousel.tsx"
import DragGrid from '@components/settingsPanel/DragGrid.tsx'
import { Z } from '@config/zIndex.ts'
import { contentComp } from '../compositions/laneComps.ts'

/** LAYER 2/3! Interactive=false carousel. Contents are mounted inside!
 * The carousel swipes are handled by baseLayer. */
export default function ContentLayer() {
  return (
    <div className="layer content-layer" style={{ zIndex: Z.content }}>
      {contentComp.map(comp => {
        const oneCarousel = (
          < Carousel
            key={`${comp.id}-content`}
            {...comp}
          />
        )

        if (comp.renderLayer) {
          return (
            <div
              key={`${comp.id}-content-layer`}
              className="layer content-layer"
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