import type { DiagnosticData, InvalidVarDeclaration, MissingClass, UnusableSelector, VariableMismatch } from '../../types/diagnostics.types.ts';
import type { CompilerRun } from '../../compiler/tracking/compilerRun.ts';
import { mergeIssueGroups } from '../../compiler/tracking/issueCollector.ts';
import { extractGroupName } from '../../compiler/resolvers/extractGroupName.ts';
import { analyzeSelectors } from "./analyzers/analyzeSelectors.ts";
import { analyzeTokens } from './analyzers/analyzeTokens.ts';
import { analyzeVariableUsage } from './analyzers/analyzeVariableUsage.ts';
import { analyzeWriteResult } from './analyzers/analyzeWriteResult.ts'
import { analyzeIssues } from './analyzers/analyzeIssues.ts';
import { analyzeVariableDeclarations } from './analyzers/analyzeVariableDeclarations.ts';
import type { TokenCache } from '@styleTokens/compiler/tracking/tokenCache.ts';

export function buildData({
  cache,
  run
}: {
  cache: TokenCache,
  run: CompilerRun
}): DiagnosticData {

  const missingClasses: MissingClass[] = []
  const unusableSelectors: UnusableSelector[] = []
  const mismatchedVariables: VariableMismatch[] = []
  const invalidVarDeclarations: InvalidVarDeclaration[] = []
  /*---------------------------------------
          NON-Group specific
  -------------------------------------*/

  const emitResult = run.getEmitResult()
  const runGroups = cache.getCssDataGroupsByPaths(
    run.getProcessedPaths()
  )

  const missingCssModules = cache.getMissingCssGroupPaths()
    .map(groupPath => extractGroupName(groupPath))

  const issues = analyzeIssues(mergeIssueGroups(run.getIssues()))

  const generatedFiles = analyzeWriteResult(emitResult?.writeResult)

  //patchResult currently unused... needs to use all emitResults...

  const omittedPresetFiles =
    emitResult?.extractResult.omittedPresetFiles ?? []

  for (const group of runGroups) {
    /*---------------------------------------
          NON-Css Data
    -------------------------------------*/

    /*---------------------------------------
      Css Data dependencies
    -------------------------------------*/

    const selectorResult = analyzeSelectors(group.cssData);
    if (selectorResult) unusableSelectors.push(selectorResult)

    missingClasses.push(...analyzeTokens(group.cssData))
    mismatchedVariables.push(...analyzeVariableUsage(group))
    invalidVarDeclarations.push(...analyzeVariableDeclarations(group))
  }

  return {
    missingClasses,
    unusableSelectors,
    mismatchedVariables,
    invalidVarDeclarations,
    missingCssModules,
    processedGroupCount: runGroups.length,
    generatedFiles,
    issues,
    omittedPresetFiles
  }
}