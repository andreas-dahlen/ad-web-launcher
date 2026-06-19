import { carouselStore } from '@primitives/carousel/store/carousel.store'
import { dragStore } from '@primitives/drag/store/drag.store'
import { scrollStore } from '@primitives/scroll/store/scroll.store'
import { sliderStore } from '@primitives/slider/store/slider.store'
import { gestureStore } from '../../shared/stores/gesture.store'
import { wallpaperStore } from '@stores/wallpaper.store'
import { settingsStore } from '@stores/settings.store'
import { appStore } from '@stores/app.store'

export function resetInteractionStores() {
  carouselStore.setState({ bindings: {} })
  sliderStore.setState({ bindings: {} })
  dragStore.setState({ bindings: {} })
  scrollStore.setState({ bindings: {} })
  gestureStore.setState({ activeGesture: 'none', gestureNodes: {} })
  wallpaperStore.setState({ wallpapers: [], pool: [] })
  settingsStore.setState({
    settings: {
      layoutManagerEnabled: false,
      panelOpen: false,
      dragEnabled: false,
      //drag specifics
      gridVisible: false,
      snapEnabled: false,
      dragSnapX: 8,
      dragSnapY: 16
    }
  })
  appStore.setState({ loading: false })
}