import type { PathChoice, TreeNode } from '../types/core.types.ts';
import picomatch from 'picomatch'
import { hasBasePath } from '../utils/comparePaths.ts';

export default function normalizeGlob(
  pattern: string,
  fileTree: TreeNode[]
): PathChoice {
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
    action: 'exclude',
    files,
    folders
  }
}