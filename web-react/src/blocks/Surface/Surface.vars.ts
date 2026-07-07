import type { StyleFromVars, VarDef } from '@utils/svsx.types';
import css from './Surface.module.css'
export const surfaceVars = {
  bg: { name: "bg", allowed: ["t", "f"] as const },
  border: { name: "border", allowed: ["t", "f"] as const },
  radius: { name: "radius", allowed: ["t", "f"] as const },
  opacity: { name: "opacity", allowed: [] as const },
  blur: { name: "blur", allowed: [] as const },
  boxShadow: { name: "box-shadow", allowed: ["t", "f"] as const },
  width: { name: "width", allowed: [] as const },
  height: { name: "height", allowed: [] as const },
  margin: { name: "margin", allowed: [] as const },
  padding: { name: "padding", allowed: [] as const },
  gap: { name: "gap", allowed: [] as const },
  overflow: { name: "overflow", allowed: [] as const },
  position: { name: "position", allowed: [] as const },
  direction: { name: "direction", allowed: [] as const },
  justify: { name: "justify", allowed: [] as const },
  align: { name: "align", allowed: [] as const }
} satisfies Record<string, VarDef>

export const surfaceAlwaysAllowed = ["o", "p"] as const

export type SurfaceStyle = StyleFromVars<typeof surfaceVars, typeof surfaceAlwaysAllowed>;

export const surfacePreset = {
  bg: css.bg,
  frame: css.frame,
  row: css.row,
  combo: { row: css.row, frame: css.frame }
} as const

export type SurfacePreset = keyof typeof surfacePreset;

