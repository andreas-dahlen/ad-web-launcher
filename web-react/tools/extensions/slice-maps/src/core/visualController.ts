import type { VisualCache } from '../cache/visualCache.ts';
import type { Scope } from '../types/dataStructure.types.ts';

export type VisualController = NonNullable<ReturnType<typeof createVisualController>>
export function createVisualController(
  { updateTree, loader, root }: Scope,
  visualCache: VisualCache
) {

  function setTreeView() {
    visualCache.setData({ data: loader.fileTree() })
    visualCache.setRoot(root)
    updateTree()
  }

  async function update(mergeId: string) {
    void mergeId
  }
  async function clear() {
    void visualCache
  }


  return {
    update,
    clear,
    setTreeView
  }
}