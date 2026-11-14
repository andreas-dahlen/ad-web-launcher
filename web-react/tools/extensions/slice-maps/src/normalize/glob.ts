import type { FilesAndFolders, TreeNode } from '../types/core.types.ts';
import picomatch from 'picomatch'
import { hasBasePath } from '../utils/comparePaths.ts';
import type { LoadTree } from '../loaders/loadTree.ts';

export type GlobHandler = ReturnType<typeof createGlobHandler>
export function createGlobHandler(
  loadTree: LoadTree) {

  function globSingle(pattern: string): FilesAndFolders {

    return normalizeGlob(pattern, loadTree.build())
  }

  function globMany(absolutePaths: string[]): FilesAndFolders | undefined {
    const tree = loadTree.build()
    const paths: FilesAndFolders = {
      files: new Set(),
      folders: new Set()
    }
    for (const path of absolutePaths) {
      const name = path.split(/[\\/]/).pop()
      if (!name) continue

      const pattern = `**/${name}`
      const normalized = normalizeGlob(pattern, tree)

      normalized.files.forEach(file => paths.files.add(file))
      normalized.folders.forEach(folder => paths.folders.add(folder))
    }

    if (paths.files.size === 0 && paths.folders.size === 0) return

    return paths
  }

  function normalizeGlob(
    pattern: string,
    fileTree: TreeNode[]
  ): FilesAndFolders {
    const matcher = picomatch(pattern, { dot: true })
    const rawFolders: string[] = []
    const rawFiles: string[] = []

    function convertToPaths(nodes: TreeNode[]) {
      for (const node of nodes) {
        if (matcher(node.path)) {
          if (node.type === 'folders') {
            rawFolders.push(node.path)
          } else {
            rawFiles.push(node.path)
          }
        }

        if (node.children) {
          convertToPaths(node.children)
        }
      }
    }

    convertToPaths(fileTree)


    const folders = new Set(
      rawFolders.filter(folder => !hasBasePath(rawFolders, folder))
    )

    const files = new Set(
      rawFiles.filter(file => !hasBasePath(rawFolders, file))
    )

    return {
      files,
      folders
    }
  }
  return { globSingle, globMany }
}