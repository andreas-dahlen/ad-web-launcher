import type { EffectiveResult, InharitedTruth, MergedSlice, NodeSemantics, NodeState, ResolvedExclusion, TreeNode } from '../types/dataStructure.types.ts';
import * as vscode from 'vscode'
import { compress } from './compress.ts';
import { createDebug } from '../utils/debug.ts';

export function resolveExclusion(
  slice: MergedSlice,
  fileTree: TreeNode[],
  output: vscode.OutputChannel
): ResolvedExclusion {
  const debug = createDebug(output, "resolution")

  const baseTruth = resolveBaseTruth(slice, fileTree)
  debug('baseTruth:', baseTruth)
  const result = effectiveResult(baseTruth, fileTree)
  debug('resolution:', result.resolution)
  const resolvedExclude = compress(result.resolution, output)

  return { result, resolvedExclude }
}

function resolveBaseTruth( //rename to resolve parent structure or something?
  slice: MergedSlice,
  fileTree: TreeNode[]
): Map<string, InharitedTruth> {
  const baseTruth = new Map<string, InharitedTruth>()

  function topToBottomLoop(
    nodes: TreeNode[],
    implicit: NodeState) {

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
  baseTruth: Map<string, InharitedTruth>,
  fileTree: TreeNode[]
): EffectiveResult {
  const resolution = new Map<string, NodeState>()
  const semantics = new Map<string, NodeSemantics>()

  walkReverseOrder(fileTree, ({ path, children }) => {
    const { implicit, explicit } = baseTruth.get(path)!
    if (explicit === 'include') {
      resolution.set(path, 'include')
      semantics.set(path, { type: 'explicit', outcome: 'include' })
      return
    }
    if (implicit === 'include' && explicit !== 'exclude') {
      resolution.set(path, 'include')
      semantics.set(path, { type: 'implicit', outcome: 'include' })
      return
    }
    const hasIncludedChild =
      children?.some(child => resolution.get(child.path) === 'include') ?? false

    const type = explicit ? 'explicit' : 'implicit'

    if (hasIncludedChild) {
      resolution.set(path, 'include')
      semantics.set(path, { type, outcome: 'overwritten' })
      return
    }
    resolution.set(path, 'exclude')
    semantics.set(path, { type, outcome: 'exclude' })
  })
  return { resolution, semantics }
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