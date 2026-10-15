export type AppStateCache = NonNullable<ReturnType<typeof createAppStateCache>>
export function createAppStateCache() {

  let totalExclude: Record<string, boolean> | undefined

  return {
    getTotalExclude(): Record<string, boolean> | undefined {
      return totalExclude
    },

    setExcludes(
      total: ExclusionFileData): void {
      totalExclude = total
    }
  }
}