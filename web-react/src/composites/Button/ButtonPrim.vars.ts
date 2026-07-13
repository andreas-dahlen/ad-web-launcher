import css from './Button.module.css'
export const buttonPreset = {
  default: css.button,
  notInFlow: css.notInFlow,
  close: css.close
} as const

export type ButtonPreset = keyof typeof buttonPreset