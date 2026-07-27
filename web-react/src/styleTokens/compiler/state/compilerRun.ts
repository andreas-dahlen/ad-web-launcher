import type { CssData } from '../../types/compiler.types';

export type CompilerRun = ReturnType<typeof createCompilerRun>;
export default function createCompilerRun(groupPaths: string[]) {

  // changedGroups: new Set<string>(),
  // processedTokens: new Set<string>(),
  // missingGroups: new Set<string>(),

  const missingCssModules = new Set<string>()
  const unusedCssModules = new Set<string>()
  const processedCssData = new Map<string, CssData>()

  for (const groupPath of groupPaths) {
    recordMissingModule(groupPath)
  }
  function reset() {
    missingCssModules.clear()
    unusedCssModules.clear()
    processedCssData.clear()
  }
  function recordMissingModule(groupPath: string) {
    missingCssModules.add(groupPath)
  }
  function recordUnusedModule(cssPath: string) {
    unusedCssModules.add(cssPath)
  }
  function recordCssData(groupPath: string, cssData: CssData) {
    processedCssData.set(groupPath, cssData)
  }
  return {
    reset,
    recordMissingModule,
    recordCssData,
    recordUnusedModule,

    getMissingModules() { return [...missingCssModules] },
    getUnusedModules() { return [...unusedCssModules] },
    getProcessedGroupPaths() {
      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      return [...processedCssData.keys()]
    },
    getCssData(groupPath: string) {
      return processedCssData.get(groupPath)
    }
  } as const
}