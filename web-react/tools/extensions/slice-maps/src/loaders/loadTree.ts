import fs from 'node:fs'
import path from 'node:path'

import type { TreeNode } from '../types/dataStructure.types.ts'

const traversalStops = new Set([
  '.git',
  'node_modules',
])

export function loadTree(root: string): TreeNode[] {
  function load(current: string): TreeNode {
    const name = path.basename(current)
    const relativePath = path.relative(root, current)
    const stats = fs.statSync(current)

    if (stats.isFile()) {
      return {
        name,
        path: relativePath,
        type: 'files',
      }
    }

    if (traversalStops.has(name)) {
      return {
        name,
        path: relativePath,
        type: 'folders',
      }
    }

    return {
      name,
      path: relativePath,
      type: 'folders',
      children: fs.readdirSync(current).map(child =>
        load(path.join(current, child)),
      ),
    }
  }

  return fs.readdirSync(root).map(child =>
    load(path.join(root, child)),
  )
}