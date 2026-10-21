import fs from 'node:fs'
import path from 'node:path'
import type { TreeNode } from '../types/core.types.ts'
import picomatch from 'picomatch'


export function buildFileTree(
  root: string,
  excl: Record<string, boolean>,
  traversalStops: string[]
): TreeNode[] {
  const stops = new Set(traversalStops)

  const matchers = getMatches(excl)

  function load(current: string): TreeNode | undefined {
    const name = path.basename(current)
    const relativePath = path.relative(root, current)
      .replaceAll(path.sep, '/')

    if (matchers.some(matches => matches(relativePath))) { return }

    const stats = fs.statSync(current)

    if (stats.isFile()) {
      return {
        path: relativePath,
        type: 'files'
      }
    }

    if (stops.has(name)) {
      return {
        path: relativePath,
        type: 'folders'
      }
    }

    const rawChildren = fs.readdirSync(current).map(child =>
      load(path.join(current, child)))

    return {
      path: relativePath,
      type: 'folders',
      children: filterUndefined(rawChildren
      )
    }
  }

  return filterUndefined(
    fs.readdirSync(root)
      .map(child =>
        load(path.join(root, child)))
  )
}

function filterUndefined(
  mix: (TreeNode | undefined)[]
): TreeNode[] {
  return mix.filter(entry => entry !== undefined)
}


function getMatches(check: Record<string, boolean>) {
  const enabledExcludes = Object.entries(check)
    .filter((entry) => entry[1] === true)

  return enabledExcludes
    .map((entry) => picomatch(entry[0], { dot: true }))
}