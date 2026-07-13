import css from './SvgIcon.module.css'

export const svgIconPreset = {
  big: css.svg
} as const

export type SvgIconPreset = keyof typeof svgIconPreset