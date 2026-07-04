export const buttonVars = {
  position: "--button-position",
  width: "--button-width",
  height: "--button-height",
  bg: "--button-color",
  radius: "--button-radius",
  border: "--button-border",
} as const

export type ButtonVarKey = keyof typeof buttonVars
export type ButtonStyleOverrides = Partial<Record<ButtonVarKey, string | number>>