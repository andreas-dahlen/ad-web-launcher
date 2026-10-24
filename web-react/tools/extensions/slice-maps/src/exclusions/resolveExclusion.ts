import type { MergedSlice, ExcludeOrInclude, TreeNode } from '../types/core.types.ts';
import { compress } from './compress.ts';
import type { ResolutionDetails, InheritedTruth, NodeSemantics, ExclusionResolution } from '../types/exclusion.types.ts';
import * as vscode from 'vscode'
export function resolveExclusion(
  slice: MergedSlice,
  fileTree: TreeNode[],
): ExclusionResolution {

  const startTruth = performance.now()
  const baseTruth = resolveInheritedTruth(slice, fileTree)
  const truthDuration = performance.now() - startTruth

  const startEffective = performance.now()
  const details = effectiveResult(baseTruth, fileTree)
  const effectiveDuration = performance.now() - startEffective

  const startCompress = performance.now()
  const resolvedExclude = compress(details.completeExclude)
  const compressDuration = performance.now() - startCompress


  void vscode.window.showInformationMessage(
    `truth: ${truthDuration.toFixed(2)} ms | ` +
    `effective: ${effectiveDuration.toFixed(2)} ms` +
    `compress: ${compressDuration.toFixed(2)} ms `
  )

  return { details, resolvedExclude }
}

function resolveInheritedTruth(
  slice: MergedSlice,
  fileTree: TreeNode[]
): Map<string, InheritedTruth> {
  const baseTruth = new Map<string, InheritedTruth>()

  const includeFiles = new Set(slice.includeFiles)
  const includeFolders = new Set(slice.includeFolders)
  const excludeFiles = new Set(slice.excludeFiles)
  const excludeFolders = new Set(slice.excludeFolders)

  function topToBottomLoop(
    nodes: TreeNode[],
    implicit: ExcludeOrInclude) {

    for (const node of nodes) {
      const isExplicitInclude = includeFiles.has(node.path)
        || includeFolders.has(node.path)

      const isExplicitExclude = excludeFiles.has(node.path)
        || excludeFolders.has(node.path)

      const explicit = isExplicitInclude
        ? 'include'
        : (isExplicitExclude ? 'exclude' : null)

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

  function resolve(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node.children) {
        resolve(node.children)
      }

      const { path, children } = node
      const { implicit, explicit } = baseTruth.get(path)!
      if (explicit === 'include') {
        completeExclude.set(path, 'include')
        semantics.set(path, { type: 'explicit', outcome: 'include' })
        continue
      }
      if (implicit === 'include' && explicit !== 'exclude') {
        completeExclude.set(path, 'include')
        semantics.set(path, { type: 'implicit', outcome: 'include' })
        continue
      }
      const hasIncludedChild =
        children?.some(child => completeExclude.get(child.path) === 'include') ?? false

      const type = explicit ? 'explicit' : 'implicit'

      if (hasIncludedChild) {
        completeExclude.set(path, 'include')
        semantics.set(path, { type, outcome: 'overwritten' })
        continue
      }
      completeExclude.set(path, 'exclude')
      semantics.set(path, { type, outcome: 'exclude' })
    }
  }
  resolve(fileTree)

  return { completeExclude, semantics, baseTruth }
}