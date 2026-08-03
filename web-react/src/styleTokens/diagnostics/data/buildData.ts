import type { DiagnosticData, InvalidVarDeclaration, MissingClass, UnusableSelector, VariableMismatch } from '../../types/diagnostics.types.ts';
import type { CompilerRun } from '../../compiler/tracking/compilerRun.ts';
import type { TokenCache } from "../../compiler/tracking/tokenCache.ts";
import { mergeIssueGroups } from '../../compiler/tracking/issueCollector.ts';
import { extractGroupName } from '../../compiler/resolvers/extractGroupName.ts';
import { resolveProcessedGroups } from '../../compiler/resolvers/resolveProcessedGroups.ts';
import { analyzeSelectors } from "./analyzers/analyzeSelectors.ts";
import { analyzeTokens } from './analyzers/analyzeTokens.ts';
import { analyzeVariableUsage } from './analyzers/analyzeVariableUsage.ts';
import { analyzeWriteResult } from './analyzers/analyzeWriteResult.ts'
import { analyzeIssues } from './analyzers/analyzeIssues.ts';
import { analyzeVariableDeclarations } from './analyzers/analyzeVariableDeclarations.ts';

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


  const groups = resolveProcessedGroups(cache, run)

  const processedGroupCount = groups.length

  for (const group of groups) {
    /*---------------------------------------
          NON-Css Data
    -------------------------------------*/

    //nothing yet xD

    const cssData = run.getCssData(group.groupPath)
    if (!cssData) {
      //this should NOT throw... 
      continue;
    }

    /*---------------------------------------
      Css Data dependencies
    -------------------------------------*/

    const selectorResult = analyzeSelectors(cssData);
    if (selectorResult) unusableSelectors.push(selectorResult)

    missingClasses.push(...analyzeTokens(cssData))
    mismatchedVariables.push(...analyzeVariableUsage(cssData, group))
    invalidVarDeclarations.push(...analyzeVariableDeclarations(cssData, group))
  }

  return {
    missingClasses,
    unusableSelectors,
    mismatchedVariables,
    invalidVarDeclarations,
    missingCssModules,
    processedGroupCount,
    generatedFiles,
    issues
  }
}