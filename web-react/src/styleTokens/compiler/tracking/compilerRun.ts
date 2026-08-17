import type { IssueGroup } from '@styleTokens/types/issueCollector.types.ts';
import type { EmitResult } from '../../types/compiler.types.ts';

export type CompilerRun = ReturnType<typeof createCompilerRun>;
export function createCompilerRun(groupPaths: string[]) {

  const missingCssModules = new Set<string>()
  const unusedCssModules = new Set<string>()
  let emitResult: EmitResult | undefined
  const processedIssues: IssueGroup[] = []

  for (const groupPath of groupPaths) {
    recordMissingModule(groupPath)
  }
  function reset() {
    missingCssModules.clear()
    unusedCssModules.clear()
    emitResult = undefined
    processedIssues.length = 0
  }
  function recordMissingModule(groupPath: string) {
    missingCssModules.add(groupPath)
  }
  function recordUnusedModule(cssPath: string) {
    unusedCssModules.add(cssPath)
  }

  function recordEmitResult(result: EmitResult) {
    emitResult = result
  }
  function recordIssues(issues: IssueGroup[]) {
    processedIssues.push(...issues)
  }

  return {
    reset,
    recordMissingModule,
    recordUnusedModule,
    recordEmitResult,
    recordIssues,

    getMissingModules() { return [...missingCssModules] },
    getUnusedModules() { return [...unusedCssModules] },
    getEmitResult() { return emitResult },
    getIssues() { return [...processedIssues] }
  } as const
}