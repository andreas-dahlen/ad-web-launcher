import type { StyleFromVars } from '@utils/svsx.types';
import css from './Surface.module.css'
import { surface } from '../../shared/styleSystem/schema'
export type SurfaceStyle = StyleFromVars<typeof surface.vars, typeof surface.alwaysAllowed>;

export const surfacePreset = {
  bg: css.bg,
  frame: css.frame,
  row: css.row,
  combo: { row: css.row, frame: css.frame }
} as const

export type SurfacePreset = keyof typeof surfacePreset;



// export const surfaceVars = {
//   bg: { name: "bg", allowed: ["t", "f"] as const },
//   border: { name: "border", allowed: ["t", "f"] as const },
//   radius: { name: "radius", allowed: ["t", "f"] as const },
//   opacity: { name: "opacity", allowed: [] as const },
//   blur: { name: "blur", allowed: [] as const },
//   boxShadow: { name: "box-shadow", allowed: ["t", "f"] as const },
//   width: { name: "width", allowed: [] as const },
//   height: { name: "height", allowed: [] as const },
//   margin: { name: "margin", allowed: [] as const },
//   padding: { name: "padding", allowed: [] as const },
//   gap: { name: "gap", allowed: [] as const },
//   overflow: { name: "overflow", allowed: [] as const },
//   position: { name: "position", allowed: [] as const },
//   direction: { name: "direction", allowed: [] as const },
//   justify: { name: "justify", allowed: [] as const },
//   align: { name: "align", allowed: [] as const }
// } satisfies Record<string, VarDef>

// export const surfaceAlwaysAllowed = ["o", "p"] as const


