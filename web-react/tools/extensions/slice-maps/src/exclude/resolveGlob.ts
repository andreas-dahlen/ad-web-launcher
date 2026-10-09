import type { NormalizedPaths, TreeNode } from '../types/dataStructure.types.ts';
import picomatch from 'picomatch'
import { hasBasePath } from '../utils/comparePaths.ts';

export default function resolveGlob(
  pattern: string,
  fileTree: TreeNode[]
): NormalizedPaths {
  const matcher = picomatch(pattern)
  const folders = new Set<string>()
  const files = new Set<string>()

  function convertToPaths(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (matcher(node.path)) {
        if (node.type === 'folders') {
          folders.add(node.path)
        } else {
          files.add(node.path)
        }
      }

      if (node.children) {
        convertToPaths(node.children)
      }
    }
  }

  convertToPaths(fileTree)


  const excludeFolders = [...folders].filter(
    folder => !hasBasePath(folders, folder)
  )

  const excludeFiles = [...files].filter(
    file => !hasBasePath(folders, file)
  )

  return {
    includeFiles: [],
    includeFolders: [],
    excludeFiles,
    excludeFolders
  }
}