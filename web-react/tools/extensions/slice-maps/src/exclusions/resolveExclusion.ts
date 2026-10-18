import type { MergedSlice, ExcludeOrInclude, TreeNode } from '../types/core.types.ts';
import * as vscode from 'vscode'
import { compress } from './compress.ts';
import { createDebug } from '../utils/debug.ts';
import type { ResolutionDetails, InheritedTruth, NodeSemantics, ExclusionResolution } from '../types/exclusion.types.ts';

export function resolveExclusion(
  slice: MergedSlice,
  fileTree: TreeNode[],
  output: vscode.OutputChannel
): ExclusionResolution {
  const debug = createDebug(output, "resolution")

  const baseTruth = resolveInheritedTruth(slice, fileTree)
  debug('baseTruth:', [...baseTruth])
  const details = effectiveResult(baseTruth, fileTree)
  debug('resolution:', [...details.completeExclude])
  const resolvedExclude = compress(details.completeExclude, output)

  return { details, resolvedExclude }
}

function resolveInheritedTruth(
  slice: MergedSlice,
  fileTree: TreeNode[]
): Map<string, InheritedTruth> {
  const baseTruth = new Map<string, InheritedTruth>()

  function topToBottomLoop(
    nodes: TreeNode[],
    implicit: ExcludeOrInclude) {

    for (const node of nodes) {
      const explicitInclude = slice.includeFiles.includes(node.path)
        || slice.includeFolders.includes(node.path)

      const explicitExclude = slice.excludeFiles.includes(node.path)
        || slice.excludeFolders.includes(node.path)

      const explicit = explicitInclude
        ? 'include'
        : (explicitExclude ? 'exclude' : null)

      baseTruth.set(node.path, { implicit, explicit })

      const implicitToChild = explicit ?? implicit

      if (node.children) {
        topToBottomLoop(node.children, implicitToChild)
      }
    }
  }
  topToBottomLoop(fileTree, 'include')
  return baseTruth
}

function effectiveResult(
  baseTruth: Map<string, InheritedTruth>,
  fileTree: TreeNode[]
): ResolutionDetails {
  const completeExclude = new Map<string, ExcludeOrInclude>()
  const semantics = new Map<string, NodeSemantics>()

  walkReverseOrder(fileTree, ({ path, children }) => {
    const { implicit, explicit } = baseTruth.get(path)!
    if (explicit === 'include') {
      completeExclude.set(path, 'include')
      semantics.set(path, { type: 'explicit', outcome: 'include' })
      return
    }
    if (implicit === 'include' && explicit !== 'exclude') {
      completeExclude.set(path, 'include')
      semantics.set(path, { type: 'implicit', outcome: 'include' })
      return
    }
    const hasIncludedChild =
      children?.some(child => completeExclude.get(child.path) === 'include') ?? false

    const type = explicit ? 'explicit' : 'implicit'

    if (hasIncludedChild) {
      completeExclude.set(path, 'include')
      semantics.set(path, { type, outcome: 'overwritten' })
      return
    }
    completeExclude.set(path, 'exclude')
    semantics.set(path, { type, outcome: 'exclude' })
  })
  return { completeExclude, semantics, baseTruth }
}

export function walkReverseOrder(
  nodes: TreeNode[],
  visit: (node: TreeNode) => void
): void {
  for (const node of nodes) {
    if (node.children) {
      walkReverseOrder(node.children, visit)
    }
    visit(node)
  }
}