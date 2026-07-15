import css from './Slider.module.css'

export const sliderPreset = {
  default: css.placeHolder
} as const

export type SliderPreset = keyof typeof sliderPreset