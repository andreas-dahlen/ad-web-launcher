import type { IssueGroup } from '../../types/issueCollector.types.ts';
import type { EmitResult } from '../../types/compiler.types.ts';

export type CompilerRun = ReturnType<typeof createCompilerRun>;
export function createCompilerRun(loadedIssues: IssueGroup[]) {

  const processedPaths = new Set<string>()

  let emitResult: EmitResult | undefined
  const processedIssues: IssueGroup[] = []

  recordIssues(loadedIssues)

  function reset() {
    processedPaths.clear()

    emitResult = undefined
    processedIssues.length = 0
  }
  function recordProcessed(cssPath: string) {
    processedPaths.add(cssPath)
  }

  function recordEmitResult(result: EmitResult) {
    emitResult = result
  }
  function recordIssues(issues: IssueGroup[]) {
    processedIssues.push(...issues)
  }

  return {
    reset,

    recordProcessed,

    recordEmitResult,
    recordIssues,

    getProcessedPaths() { return [...processedPaths] },
    getEmitResult() { return emitResult },
    getIssues() { return [...processedIssues] }
  } as const
}