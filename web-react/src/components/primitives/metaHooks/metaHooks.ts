// import { useEffect } from "react";
// import { createStore } from "@interaction/state/stateReactAdapter";

// interface RenderMapState {
//   nodes: RenderNode[]
// }

// export const useRenderMapState = createStore<RenderMapState>({
//   nodes: []
// })

// export function useRenderMap(
//   id: string,
//   layer: Layer,
//   element: React.ReactNode,
//   overrideZ?: number
// ) {
//   useEffect(() => {
//     if (!element) return

//     useRenderMapState.setState((s) => {
//       const existingIdx = s.nodes.findIndex(n => n.id === id)

//       const entry = { id, layer, element, overrideZ }

//       if (existingIdx !== -1) {
//         s.nodes[existingIdx] = entry
//       } else {
//         s.nodes.push(entry)
//       }
//     })

//     return () => {
//       useRenderMapState.setState((s) => {
//         s.nodes = s.nodes.filter(n => n.id !== id)
//       })
//     }
//   }, [id, layer, element, overrideZ])
// }

// // THIS IS THE ACTUAL VARIABLE
// export const renderMap: RenderNode[] = [];

// const nodes = useRenderMapState.useStore(s => s.nodes)

// const sorted = [...nodes].sort((a, b) => {
//   const za = LAYER_PRIORITY[a.layer] + (a.overrideZ ?? 0)
//   const zb = LAYER_PRIORITY[b.layer] + (b.overrideZ ?? 0)
//   return za - zb
// })