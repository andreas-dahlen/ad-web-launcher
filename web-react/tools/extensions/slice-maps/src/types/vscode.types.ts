export type OverrideBehavior = 'recursive' | 'preserve'

export type ExclusionFileData = {
  total: Record<string, boolean>
  local: Record<string, boolean>
}