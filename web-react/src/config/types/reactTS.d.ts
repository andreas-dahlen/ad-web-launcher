import type { ReactNode } from "react";

declare global {
  export interface ChildrenProps {
    children: ReactNode; // <- this is the key
  }
}

// export const __dummy = 0