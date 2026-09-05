import { carouselStore } from '@primitives/Carousel/store/carousel.store.ts'
import { dragStore } from '@primitives/Drag/store/drag.store.ts'
import { scrollStore } from '@primitives/Scroll/store/scroll.store.ts'
import { sliderStore } from '@primitives/Slider/store/slider.store.ts'
import { gestureStore } from '../../shared/state/stores/gesture.store.ts'
import { wallpaperStore } from '@stores/wallpaper.store.ts'
import { settingsStore } from '@stores/settings.store.ts'

export function resetInteractionStores() {
  carouselStore.setState({ bindings: {} })
  sliderStore.setState({ bindings: {} })
  dragStore.setState({ bindings: {} })
  scrollStore.setState({ bindings: {} })
  gestureStore.setState({ activeGesture: 'none', gestureNodes: {} })
  wallpaperStore.setState({ wallpapers: [], pool: [] })
  settingsStore.setState({
    settings: {
      settingsMode: "default",
      layoutMode: "lanes",
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