import type { DiagnosticData, InvalidVarDeclaration, MissingClass, UnusableSelector, VariableMismatch } from '../../types/diagnostics.types.ts';
import type { CompilerRun } from '../../compiler/tracking/compilerRun.ts';
import type { TokenCache } from "../../compiler/tracking/tokenCache.ts";
import { mergeIssueGroups } from '../../compiler/tracking/issueCollector.ts';
import { extractGroupName } from '../../compiler/resolvers/extractGroupName.ts';
import { analyzeSelectors } from "./analyzers/analyzeSelectors.ts";
import { analyzeTokens } from './analyzers/analyzeTokens.ts';
import { analyzeVariableUsage } from './analyzers/analyzeVariableUsage.ts';
import { analyzeWriteResult } from './analyzers/analyzeWriteResult.ts'
import { analyzeIssues } from './analyzers/analyzeIssues.ts';
import { analyzeVariableDeclarations } from './analyzers/analyzeVariableDeclarations.ts';
import { assert } from '../../compiler/processing/assertions.ts';

export function buildData(
  cache: TokenCache,
  run: CompilerRun,
  //tracker!?
): DiagnosticData {

  const missingClasses: MissingClass[] = []
  const unusableSelectors: UnusableSelector[] = []
  const mismatchedVariables: VariableMismatch[] = []
  const invalidVarDeclarations: InvalidVarDeclaration[] = []
  /*---------------------------------------
          NON-Group specific
  -------------------------------------*/

  const missingCssModules = run.getMissingModules()
    .map(groupPath => extractGroupName(groupPath))

  const emitResult = run.getEmitResult()
  const issues = analyzeIssues(mergeIssueGroups(run.getIssues()))

  const generatedFiles = analyzeWriteResult(emitResult?.writeResult)

  //patchResult currently unused...

  const omittedPresetFiles =
    emitResult?.extractResult.omittedPresetFiles ?? []

  const groups = cache.getGroups()

  const processedGroupCount = groups.length

  for (const group of groups) {
    /*---------------------------------------
          NON-Css Data
    -------------------------------------*/

    //nothing yet xD

    /*---------------------------------------
      Css Data dependencies
    -------------------------------------*/
    assert.hasCssPath(group)
    assert.hasCssData(group)

    const selectorResult = analyzeSelectors(group.cssData);
    if (selectorResult) unusableSelectors.push(selectorResult)

    missingClasses.push(...analyzeTokens(group.cssData))
    mismatchedVariables.push(...analyzeVariableUsage(group.cssData, group))
    invalidVarDeclarations.push(...analyzeVariableDeclarations(group.cssData, group))
  }

  return {
    missingClasses,
    unusableSelectors,
    mismatchedVariables,
    invalidVarDeclarations,
    missingCssModules,
    processedGroupCount,
    generatedFiles,
    issues,
    omittedPresetFiles
  }
}