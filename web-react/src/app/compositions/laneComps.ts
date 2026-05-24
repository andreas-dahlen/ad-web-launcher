import type { CarouselScenes } from '@typeScript/propsType'
import { lanes } from './laneIndex'
import type { Z } from '@config/zIndex'
import type { Axis1D } from '@typeScript/core/primitiveType'

type LayerKey = keyof typeof Z

type BaseCompConfig = CarouselScenes & {
  id: string
  axis: Axis1D
  renderLayer?: LayerKey
}

// 'id' | 'axis' | 'sceneCount' | 'scenes'

type ContentCompConfig = CarouselScenes & {
  id: string
  axis: Axis1D
  interactive: boolean
  renderLayer?: LayerKey
}

// 'id' | 'axis' | 'scenes' | 'interactive'


export const baseComp: BaseCompConfig[] = [
  {
    id: 'wallpaper',
    axis: 'vertical',
    scenes: lanes.wallPaper,
    renderLayer: 'base'
  },
  {
    id: 'top-horizontal',
    axis: 'horizontal',
    sceneCount: lanes.horizontal.top.length
  },
  {
    id: 'middle-horizontal',
    axis: 'horizontal',
    sceneCount: lanes.horizontal.mid.length
  },
  {
    id: 'bottom-horizontal',
    axis: 'horizontal',
    sceneCount: lanes.horizontal.bottom.length
  }
]

export const contentComp: ContentCompConfig[] = [
  {
    id: 'top-horizontal',
    axis: 'horizontal',
    scenes: lanes.horizontal.top,
    interactive: false
  },
  {
    id: 'middle-horizontal',
    axis: 'horizontal',
    scenes: lanes.horizontal.mid,
    interactive: false
  },
  {
    id: 'bottom-horizontal',
    axis: 'horizontal',
    scenes: lanes.horizontal.bottom,
    interactive: false
  },
  {
    id: 'wallpaper',
    axis: 'vertical',
    scenes: lanes.vertical,
    interactive: false,
    renderLayer: 'content'
  }
]