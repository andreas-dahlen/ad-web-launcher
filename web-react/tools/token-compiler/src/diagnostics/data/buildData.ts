import type { DiagnosticData, InvalidVarDeclaration, MissingClass, UnusableSelector, VariableMismatch } from '../../types/diagnostics.types.js';
import type { CompilerRun } from '../../compiler/tracking/compilerRun.js';
import { mergeIssueGroups } from '../../compiler/tracking/issueCollector.js';
import { extractGroupName } from '../../compiler/resolvers/extractGroupName.js';
import { analyzeSelectors } from "./analyzers/analyzeSelectors.js";
import { analyzeTokens } from './analyzers/analyzeTokens.js';
import { analyzeVariableUsage } from './analyzers/analyzeVariableUsage.js';
import { analyzeWriteResult } from './analyzers/analyzeWriteResult.js'
import { analyzeIssues } from './analyzers/analyzeIssues.js';
import { analyzeVariableDeclarations } from './analyzers/analyzeVariableDeclarations.js';
import type { TokenCache } from '../../compiler/tracking/tokenCache.js';

export function buildData(
  cache: TokenCache,
  run: CompilerRun
): DiagnosticData {

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