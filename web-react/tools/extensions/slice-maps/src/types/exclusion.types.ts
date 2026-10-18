import type { ExcludeOrInclude, NormalizedPaths } from './core.types.ts'

export type InheritedTruth = {
  implicit: ExcludeOrInclude
  explicit: ExcludeOrInclude | null
}

export type NodeSemantics = {
  type: 'explicit' | 'implicit'
  outcome: 'include' | 'exclude' | 'overwritten'
}

export type ResolutionDetails = {
  completeExclude: Map<string, ExcludeOrInclude>
  semantics: Map<string, NodeSemantics>
  baseTruth: Map<string, InheritedTruth>
}


export type ExclusionResolution = {
  details: ResolutionDetails
  resolvedExclude: Record<string, true>
}

export type CachedMergeData = {
  sliceData: NormalizedPaths
  details: ResolutionDetails
  resolvedExclude: Record<string, true>
}