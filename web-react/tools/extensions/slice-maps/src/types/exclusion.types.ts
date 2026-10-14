import type { ExcludeOrInclude, MergedSlice } from './core.types.ts'

export type InharitedTruth = {
  implicit: ExcludeOrInclude
  explicit: ExcludeOrInclude | null
}

export type NodeSemantics = {
  type: 'explicit' | 'implicit'
  outcome: 'include' | 'exclude' | 'overwritten'
}

export type EffectiveResult = {
  resolution: Map<string, ExcludeOrInclude>
  semantics: Map<string, NodeSemantics>
}


export type ResolvedExclusion = {
  result: EffectiveResult
  resolvedExclude: Record<string, true>
}
export type SliceResolution = MergedSlice & ResolvedExclusion