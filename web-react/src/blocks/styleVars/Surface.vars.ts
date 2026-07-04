export const surfaceVars = {
  position: "--surface-position",
  direction: "--surface-direction",
  justify: "--surface-justify",
  align: "--surface-align",
  width: "--surface-width",
  height: "--surface-height",
  overflow: "--surface-overflow",
  gap: "--surface-gap",
  margin: "--surface-margin",
  padding: "--surface-padding",
  border: "--surface-border",
  radius: "--surface-border-radius",
  bg: "--surface-bg",
  boxShadow: "--surface-box-shadow",
  blur: "--surface-blur",
  opacity: "--surface-opacity",
} as const

export type SurfaceVarKey = keyof typeof surfaceVars
export type SurfaceStyleOverrides = Partial<Record<SurfaceVarKey, string | number>>

export type PresetMap =
  | "bg"
  | "frame"
  | "row"