import { carouselStore } from '@primitives/CarouselPrim/store/carousel.store'
import { dragStore } from '@primitives/DragPrim/store/drag.store'
import { scrollStore } from '@primitives/ScrollPrim/store/scroll.store'
import { sliderStore } from '@primitives/SliderPrim/store/slider.store'
import { gestureStore } from '../../shared/state/stores/gesture.store'
import { wallpaperStore } from '@stores/wallpaper.store'
import { settingsStore } from '@stores/settings.store'

export function resetInteractionStores() {
  carouselStore.setState({ bindings: {} })
  sliderStore.setState({ bindings: {} })
  dragStore.setState({ bindings: {} })
  scrollStore.setState({ bindings: {} })
  gestureStore.setState({ activeGesture: 'none', gestureNodes: {} })
  wallpaperStore.setState({ wallpapers: [], pool: [] })
  settingsStore.setState({
    settings: {
      layoutManagerV: false,
      layoutManagerH: false,
      panelOpen: false,
      dragEnabled: false,
      //drag specifics
      gridVisible: false,
      snapEnabled: false,
      dragSnapX: 8,
      dragSnapY: 16
    }
  })
}