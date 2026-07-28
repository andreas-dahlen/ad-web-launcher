import type { CssData, EmitResult } from '../../types/compiler.types';

export type CompilerRun = ReturnType<typeof createCompilerRun>;
export default function createCompilerRun(groupPaths: string[]) {

  const missingCssModules = new Set<string>()
  const unusedCssModules = new Set<string>()
  const processedCssData = new Map<string, CssData>()
  let emitResult: EmitResult | undefined

  for (const groupPath of groupPaths) {
    recordMissingModule(groupPath)
  }
  function reset() {
    missingCssModules.clear()
    unusedCssModules.clear()
    processedCssData.clear()
    emitResult = undefined
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
  function recordEmitResult(result: EmitResult) {
    emitResult = result
  }

  return {
    reset,
    recordMissingModule,
    recordCssData,
    recordUnusedModule,
    recordEmitResult,

    getMissingModules() { return [...missingCssModules] },
    getUnusedModules() { return [...unusedCssModules] },
    getEmitResult() { return emitResult },
    getProcessedGroupPaths() {
      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      return [...processedCssData.keys()]
    },
    getCssData(groupPath: string) {
      return processedCssData.get(groupPath)
    }
  } as const
}