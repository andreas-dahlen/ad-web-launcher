// import * as vscode from 'vscode'
// import type { SliceMap } from '../types/dataStructure.types.ts'
// import type { UUID } from 'node:crypto'



// export async function deleteMap(
//   context: vscode.ExtensionContext,
//   id: UUID
// ): Promise<number> {


//   const sliceMaps =
//     context.workspaceState.get<SliceMap[]>('sliceMaps') ?? []

//   const index = sliceMaps.findIndex(map => map.id === id)

//   sliceMaps.splice(index, 1)

//   await context.workspaceState.update('sliceMaps', sliceMaps)

//   return index
// }