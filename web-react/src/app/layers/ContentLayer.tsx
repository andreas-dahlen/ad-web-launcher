import Carousel from "@carousel/Carousel.tsx"
import DragGrid from '@components/settingsPanel/DragGrid.tsx'
import { useSettingsStore } from '../../hooks/useSettings.ts'
import { Z } from '@config/zIndex.ts'
import { contentComp } from '../compositions/baseComp.ts'


/** LAYER 3/4! Interactive=false carousel. Contents are mounted inside!
 * The carousel swipes are handled by baseLayer. */
export default function ContentLayer() {
  const { gridEnabled } = useSettingsStore()
  return (
    <div className="layer" style={{ zIndex: Z.content }}>
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
              className="layer"
              style={{ zIndex: Z[comp.renderLayer] }}
            >
              {oneCarousel}
            </div>
          )
        }
        return oneCarousel
      })}
      {gridEnabled ? <DragGrid /> : ''}
    </div>
  )
}