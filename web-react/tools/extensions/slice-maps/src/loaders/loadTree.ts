
import fs from 'node:fs'
import path from 'node:path'
import type { TreeNode } from '../types/dataStructure.types.ts'

export function loadTree(root: string): TreeNode {
  const name = path.basename(root)
  const stats = fs.statSync(root)

  if (stats.isFile()) {
    return {
      name,
      path: root,
      type: 'file',
    }
  }

  return {
    name,
    path: root,
    type: 'folder',
    children: fs.readdirSync(root).map(child =>
      loadTree(path.join(root, child)),
    ),
  }
}