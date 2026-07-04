export const scrollVars = {
  width: "--scroll-width",
  height: "--scroll-height",
  knobHeight: "--knob-height",
  knobWidth: "--knob-width"
} as const

export type ScrollVarKey = keyof typeof scrollVars
export type ScrollStyleOverrides = Partial<Record<ScrollVarKey, string | number>>