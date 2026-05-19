import type { CarouselProps } from '@typeScript/propsType'
import { lanes } from './laneIndex'
import type { Z } from '@config/zIndex'

type LayerKey = keyof typeof Z

type BaseComp = Pick<
  CarouselProps,
  'id' | 'axis' | 'sceneCount' | 'scenes'
> & { renderLayer?: LayerKey }


type ContentComp = Pick<
  CarouselProps,
  'id' | 'axis' | 'scenes' | 'interactive'
> & { renderLayer?: LayerKey }

export const baseComp: BaseComp[] = [
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

export const contentComp: ContentComp[] = [
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