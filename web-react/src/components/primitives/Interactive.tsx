import Button from '../primitives/button/Button.ts'
import Carousel from '../primitives/carousel/Carousel.ts'
import Drag from '../primitives/drag/Drag.ts'
import Slider from '../primitives/slider/Slider.ts'
import type { ButtonProps } from '../primitives/button/Button.ts'
import type { CarouselProps } from '@typeScript/propsType.ts'
import type { DragProps } from '@typeScript/propsType.ts'
import type { SliderProps } from '@typeScript/propsType.ts'

type InteractiveProps =
  | ({ type: 'button' } & ButtonProps)
  | ({ type: 'carousel' } & CarouselProps)
  | ({ type: 'drag' } & DragProps)
  | ({ type: 'slider' } & SliderProps)

export default function Interactive(props: InteractiveProps) {
  switch (props.type) {
    case 'button': {
      return <Button {...props} />
    }
    case 'carousel': {
      return <Carousel {...props} />
    }
    case 'drag': {
      return <Drag {...props} />
    }
    case 'slider': {
      return <Slider {...props} />
    }
  }
}