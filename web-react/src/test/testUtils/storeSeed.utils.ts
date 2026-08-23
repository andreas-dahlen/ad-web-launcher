import { carouselStore } from '@primitives/Carousel/store/carousel.store'
import { carousel_DEFAULTS } from '@primitives/Carousel/store/useCarouselStore.hook'
import { dragStore } from '@primitives/Drag/store/drag.store'
import { drag_DEFAULTS } from '@primitives/Drag/store/useDragStore.hook'
import { scrollStore } from '@primitives/Scroll/store/scroll.store'
import { scroll_DEFAULTS } from '@primitives/Scroll/store/useScrollStore.hook'
import { sliderStore } from '@primitives/Slider/store/slider.store'
import { slider_DEFAULTS } from '@primitives/Slider/store/useSliderStore.hook'
import { merge } from '@test/testUtils/factory.utils'
import type { InteractionType } from '../../shared/types/core.types'

export function seedStoreByType(type: Exclude<InteractionType, "button">, id: string = "test", overrides = {}) {
  switch (type) {
    case "carousel": {
      const binding = merge(carousel_DEFAULTS, overrides)
      carouselStore.getState().init(id, binding)
      break
    }
    case "slider": {
      const binding = merge(slider_DEFAULTS, overrides)
      sliderStore.getState().init(id, binding)
      break
    }
    case "drag": {
      const binding = merge(drag_DEFAULTS, overrides)
      dragStore.getState().init(id, binding)
      break
    }
    case "scroll": {
      const binding = merge(scroll_DEFAULTS, overrides)
      scrollStore.getState().init(id, binding)
      break
    }
    default: {
      const _exhaustive: never = type
      throw new Error(`Unknown interaction type: ${_exhaustive}`)
    }
  }
}

export function getStoreByType(type: Exclude<InteractionType, "button">, id: string = "test") {

  switch (type) {
    case "carousel": return carouselStore.getState().bindings[id]
    case "slider": return sliderStore.getState().bindings[id]
    case "drag": return dragStore.getState().bindings[id]
    case "scroll": return scrollStore.getState().bindings[id]
    default: {
      const _exhaustive: never = type
      throw new Error(`Unknown interaction type: ${_exhaustive}`)
    }
  }
}