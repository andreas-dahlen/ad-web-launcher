import css from './Surface.module.css'
export const surfaceVars = {
  bg: { name: "surface-bg", allowed: ["theme", "fallback"] as const },
  border: { name: "surface-border", allowed: ["theme", "fallback"] as const },
  radius: { name: "surface-radius", allowed: ["theme", "fallback"] as const },
  opacity: { name: "surface-opacity", allowed: [] as const },
  blur: { name: "surface-blur", allowed: [] as const },
  boxShadow: { name: "surface-box-shadow", allowed: ["theme", "fallback"] as const },
  width: { name: "surface-width", allowed: [] as const },
  height: { name: "surface-height", allowed: [] as const },
  margin: { name: "surface-margin", allowed: [] as const },
  padding: { name: "surface-padding", allowed: [] as const },
  gap: { name: "surface-gap", allowed: [] as const },
  overflow: { name: "surface-overflow", allowed: [] as const },
  position: { name: "surface-position", allowed: [] as const },
  direction: { name: "surface-direction", allowed: [] as const },
  justify: { name: "surface-justify", allowed: [] as const },
  align: { name: "surface-align", allowed: [] as const }
} as const;

export const surfaceAlwaysAllowed = ["override", "preset"] as const
export type SurfaceVarKey = keyof typeof surfaceVars
export type SurfaceStyleOverrides = Partial<Record<SurfaceVarKey, string | number>>

export const surfacePresetMap = { //TODO rename to surfacePreset
  bg: css.bg,
  frame: css.frame,
  row: css.row,
  combo: { row: css.row, frame: css.frame }
} as const

export type SurfacePreset = keyof typeof surfacePresetMap;