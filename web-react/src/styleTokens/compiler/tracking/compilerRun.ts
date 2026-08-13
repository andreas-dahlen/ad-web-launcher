import type { IssueGroup } from '@styleTokens/types/issueCollector.types.ts';
import type { CssData, EmitResult } from '../../types/compiler.types.ts';
import type { PostData } from '@styleTokens/postCss/processPost.ts';

export type CompilerRun = ReturnType<typeof createCompilerRun>;
export function createCompilerRun(groupPaths: string[]) {

  const missingCssModules = new Set<string>()
  const unusedCssModules = new Set<string>()
  const processedCssData = new Map<string, CssData>()
  const processedPostData = new Map<string, PostData>()
  let emitResult: EmitResult | undefined
  const processedIssues: IssueGroup[] = []

  for (const groupPath of groupPaths) {
    recordMissingModule(groupPath)
  }
  function reset() {
    missingCssModules.clear()
    unusedCssModules.clear()
    processedCssData.clear()
    processedPostData.clear()
    emitResult = undefined
    processedIssues.length = 0
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
  function recordPostData(postData: PostData) {
    processedPostData.set(postData.cssPath, postData)
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
    recordCssData,
    recordPostData,
    recordUnusedModule,
    recordEmitResult,
    recordIssues,

    getMissingModules() { return [...missingCssModules] },
    getUnusedModules() { return [...unusedCssModules] },
    getEmitResult() { return emitResult },
    getProcessedGroupPaths() {
      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      return [...processedCssData.keys()]
    },
    getCssData(groupPath: string) {
      return processedCssData.get(groupPath)
    },
    getAllPostData() {
      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      return [...processedPostData.values()];
    },
    getIssues() { return [...processedIssues] }
  } as const
}