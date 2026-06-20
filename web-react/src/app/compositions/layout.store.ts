import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'



export type Binding = {
value: number
constraints: Constraints1D
layout: StoreLayout
 dragging: boolean

} 
export type LayoutStore = {
horizontalLanes: Record<string, HorizontalLane>
init: (id: string, fallback: _DEFAULT) => void
 get: (id: string) => Readonly<Binding>
delete: (id: string) => void
 setConstraints: (id: string, constraints: Constraints1D) => void
 setLayout: (id: string, packet: StoreLayout) => void
apply: (id: string, action: ??) => void
} 



export const layoutStore = create<LayoutStore>()(
  persist(
    immer((set, get) => ({
      
    })),
     { name: "Store"}
  )
)