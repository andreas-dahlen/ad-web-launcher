import Button from '@components/primitives/button/Button'
import Carousel from '@components/primitives/carousel/Carousel'
import Drag from '@components/primitives/drag/Drag'
import Slider from '@components/primitives/slider/Slider'
import type { ButtonProps } from '@components/primitives/button/Button'
import type { CarouselProps } from '@components/primitives/carousel/Carousel'
import type { DragProps } from '@components/primitives/drag/Drag'
import type { SliderProps } from '@components/primitives/slider/Slider'

type InteractiveProps =
  | ({ type: 'button' } & ButtonProps)
  | ({ type: 'carousel' } & CarouselProps)
  | ({ type: 'drag' } & DragProps)
  | ({ type: 'slider' } & SliderProps)

export default function Interactive(props: InteractiveProps) {
  switch (props.type) {
    case 'button': {
      const { ...rest } = props
      return <Button {...rest} />
    }
    case 'carousel': {
      const { ...rest } = props
      return <Carousel {...rest} />
    }
    case 'drag': {
      const { ...rest } = props
      return <Drag {...rest} />
    }
    case 'slider': {
      const { ...rest } = props
      return <Slider {...rest} />
    }
  }
}