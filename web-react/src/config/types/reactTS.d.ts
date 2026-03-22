import type { ReactNode } from "react";

declare global {
  export interface ChildrenProps {
    children: ReactNode; // <- this is the key
  }

  type Layer = "wallpaper" | "horizontal" | "interactive" | "overlay";
  
  interface RenderNode {
    id: string;
    layer: Layer;
    element: React.ReactNode;
    overrideZ?: number;
  }
  // export const __dummy = 0
}
export {}
